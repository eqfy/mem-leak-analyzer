import { Visitor } from '../visitor/Visitor';
import { AST } from '../parser/ast/AST';
import { FunctionParamDecl } from '../parser/ast/Declarations/FunctionParamDecl';
import { DefaultStmt } from '../parser/ast/Statements/DefaultStmt';
import { CompoundAssignOperator } from '../parser/ast/Operators/CompoundAssignOperator';
import { MemberExpr } from '../parser/ast/Expressions/MemberExpr';
import { VarDecl } from '../parser/ast/Declarations/VarDecl';
import { WhileStmt } from '../parser/ast/Statements/WhileStmt';
import { ImplicitCastExpr } from '../parser/ast/Expressions/ImplicitCastExpr';
import { CallExpr } from '../parser/ast/Expressions/CallExpr';
import { BinaryOperator } from '../parser/ast/Operators/BinaryOperator';
import { UnaryOperator } from '../parser/ast/Operators/UnaryOperator';
import { ExplicitCastExpr } from '../parser/ast/Expressions/ExplicitCastExpr';
import { ForStmt } from '../parser/ast/Statements/ForStmt';
import { DoStmt } from '../parser/ast/Statements/DoStmt';
import { IntegerLiteral } from '../parser/ast/Literals/IntegerLiteral';
import { SwitchStmt } from '../parser/ast/Statements/SwitchStmt';
import { ConditionalOperator } from '../parser/ast/Operators/ConditionalOperator';
import { CaseStmt } from '../parser/ast/Statements/CaseStmt';
import { ConstantExpr } from '../parser/ast/Expressions/ConstantExpr';
import { UnaryExpr } from '../parser/ast/Expressions/UnaryExpr';
import { FunctionDecl, isFunctionDecl } from '../parser/ast/Declarations/FunctionDecl';
import { IfStmt } from '../parser/ast/Statements/IfStmt';
import { NullStmt } from '../parser/ast/Statements/NullStmt';
import { DeclStmt } from '../parser/ast/Statements/DeclStmt';
import { StructFieldDecl } from '../parser/ast/Declarations/StructFieldDecl';
import { DeclRefExpr } from '../parser/ast/Expressions/DeclRefExpr';
import { ParenExpr } from '../parser/ast/Expressions/ParenExpr';
import { StructDecl } from '../parser/ast/Declarations/StructDecl';
import { ReturnStmt } from '../parser/ast/Statements/ReturnStmt';
import { StmtList } from '../parser/ast/Statements/StmtList';
import { CharacterLiteral } from '../parser/ast/Literals/CharacterLiteral';
import { BreakStmt } from '../parser/ast/Statements/BreakStmt';
import {
  cloneProgramState,
  areMemoryBlocks,
  areMemoryPointers,
  createContainer,
  createNewMemoryBlock,
  createNewMemoryPointer,
  getMemoryBlockFromProgramState,
  getMemoryBlockOrPointerFromProgramState,
  isMemoryBlock,
  MemoryBlock,
  MemoryPointer,
  mergeBlocks,
  mergePointers,
  mergeProgramStates,
  ProgramState,
  removeContainer,
  StructMemberDef,
  free,
  Status,
  allocate,
  assignMergedBlock,
  assignMergedPointer,
  invalidatePointer,
  Signal,
  getMemoryPointerFromProgramState,
  produceExprDummyOutput,
  isMemoryPointer,
  populateStructBlock
} from './ProgramState';
import { dereferencedPointerType, extractedStructType, getActualType } from '../parser/ast/ASTTypeChecker';
import { getStructMemberDef } from '../visitor/VisitorReturnTypeChecker';
import { FUNCTION_NAME_MAIN } from '../constants';
import { ErrSeverity } from '../errors/ErrorCollector';

export type AnalyzerVisitorContext = ProgramState;

export type AnalyzerVisitorReturnType =
  | [MemoryBlock, ...MemoryBlock[]]
  | [MemoryPointer, ...MemoryPointer[]]
  | StructMemberDef
  | string
  | void;

export class AnalyzerVisitor extends Visitor<AnalyzerVisitorContext, AnalyzerVisitorReturnType> {
  visitAST(n: AST, t: AnalyzerVisitorContext): void {
    console.log('visitAST');
    if (n.id === 'error id') {
      t.errorCollector.addMemoryError(
        n.range,
        'You program does not compile with Clang, try running `clang <fileName.c>`',
        ErrSeverity.Error
      );
    }
    // iterate over once to collect all the functions into the function table
    for (const node of n.inner) {
      if (isFunctionDecl(node)) {
        t.functions.set(node.name, node);
      }
    }
    // then iterate again and visit everything (including the struct declarations, global variables) except the non-main functions
    for (const node of n.inner) {
      if (!isFunctionDecl(node) || node.name === FUNCTION_NAME_MAIN) {
        this.visit(node, t, this);
      }
    }
    // cleanup the stack - stack should be t.memoryContainer
    removeContainer(t);
  }

  /* DECLARATIONS */

  visitFunctionDecl(n: FunctionDecl, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitFunctionDecl', n.id);
    if (n.inner) {
      // create a temporary scope for visiting params and body
      createContainer(t, n.name);
      let returnVal;
      for (const node of n.inner) {
        returnVal = this.visit(node, t, this);
        if (t.signal === Signal.Return) {
          t.signal = Signal.None;
          break;
        }
      }
      removeContainer(t);
      return returnVal;
    }
  }

  visitFunctionParamDecl(n: FunctionParamDecl, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitFunctionParamDecl', n.id);
    // arguments should already be provided in the programState.arguments - just pop the head off
    const [argumentId] = t.arguments.splice(0, 1);
    // assign parameter the passed-in argument value
    const argument = getMemoryBlockOrPointerFromProgramState(argumentId, t);
    if (isMemoryBlock(argument)) {
      mergeBlocks([argument], t, { id: n.id, type: n.type, name: n.name, range: n.range, parentBlock: t.memoryContainer });
    } else {
      mergePointers([argument], t, { id: n.id, type: n.type, name: n.name, range: n.range, parentBlock: t.memoryContainer });
    }
  }

  visitStructDecl(n: StructDecl, t: AnalyzerVisitorContext): void {
    console.log('visitStructDecl', n.id);
    // collect all the members
    const members = n.inner.map((node: StructFieldDecl) => getStructMemberDef(this.visit(node, t, this)));
    // record the struct definition in the program state
    t.structDefs.set(n.name, [n.name, n.range, members]);
  }

  visitStructFieldDecl(n: StructFieldDecl, t: AnalyzerVisitorContext): StructMemberDef {
    console.log('visitStructFieldDecl', n.id);
    return [n.name, n.range, getActualType(n.type)];
  }

  visitVarDecl(n: VarDecl, t: AnalyzerVisitorContext): void {
    console.log('visitVarDecl', n.id);

    const configuration = {
      id: n.id,
      name: n.name,
      type: getActualType(n.type),
      range: n.range,
      parentBlock: t.memoryContainer
    };

    // if it has no child:
    // it is a struct variable declaration
    // otherwise it simply has no initialization - store it to be a pointer / memory block based on type
    if (!n.inner) {
      const actualType = getActualType(n.type);
      if (extractedStructType(actualType)) {
        const struct = createNewMemoryBlock({
          id: n.id,
          name: n.name,
          type: actualType,
          range: n.range,
          existence: Status.Definitely,
          pointedBy: [],
          contains: [],
          parentBlock: t.memoryContainer
        });
        getMemoryBlockFromProgramState(t.memoryContainer, t).contains.push(struct.id);
        t.blocks.set(struct.id, struct);
        populateStructBlock(struct, actualType, t);
      } else if (dereferencedPointerType(getActualType(n.type))) {
        const pointer = createNewMemoryPointer(configuration);
        getMemoryBlockFromProgramState(t.memoryContainer, t).contains.push(pointer.id);
        t.pointers.set(n.id, pointer);
      } else {
        const block = createNewMemoryBlock(configuration);
        getMemoryBlockFromProgramState(t.memoryContainer, t).contains.push(block.id);
        t.blocks.set(n.id, block);
      }
    } else {
      // otherwise visit the right hand side and merge possible values
      const rhs = this.visit(n.inner[0], t, this);
      if (areMemoryBlocks(rhs)) {
        mergeBlocks(rhs, t, configuration);
      } else if (areMemoryPointers(rhs)) {
        mergePointers(rhs, t, configuration);
      } else {
        console.log('visitVarDecl', n.id, 'inner visit produces unexpected value');
      }
    }
  }

  /* EXPRESSIONS */

  visitCallExpr(n: CallExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    // returns anything that is a analyzer return type
    console.log('visitCallExpr', n.id);
    // getting the function name
    const functionName = this.visit(n.inner[0], t, this);
    if (typeof functionName !== 'string') {
      console.log('visitCallExpr', n.id, 'function name is not a string');
      return produceExprDummyOutput(n, t, {});
    }

    if (t.functions.has(functionName)) {
      // custom functions in function table: visit the arguments and record in the programState
      n.inner.slice(1).forEach((child) => {
        const entities = this.visit(child, t, this);
        if (areMemoryBlocks(entities)) {
          t.arguments.push(mergeBlocks(entities, t, { parentBlock: t.memoryContainer }).id);
        } else if (areMemoryPointers(entities)) {
          t.arguments.push(mergePointers(entities, t, { parentBlock: t.memoryContainer }).id);
        } else {
          console.log('visitCallExpr', n.id, 'function arguments are neither blocks nor pointers');
          return produceExprDummyOutput(n, t, {});
        }
      });

      // if function has been visited once - skip visiting
      if (t.callStack.has(functionName)) {
        t.arguments = [];
        return produceExprDummyOutput(n, t, {});
      }
      const functionDecl = t.functions.get(functionName);
      if (functionDecl) {
        t.callStack.set(functionName, t.memoryContainer);
        const res = this.visit(functionDecl, t, this);
        t.callStack.delete(functionName);
        return res;
      }
      return produceExprDummyOutput(n, t, {});
    }
    switch (functionName) {
      case 'malloc':
      case 'calloc':
      case 'align_alloc': {
        // visit all children
        n.inner.slice(1).forEach((argument) => {
          this.visit(argument, t, this);
        });
        const voidPointer = allocate(n.range, t);
        return [voidPointer];
      }
      case 'free': {
        const pointers = this.visit(n.inner[1], t, this);
        if (!areMemoryPointers(pointers)) {
          console.log('visitCallExpr', n.id, 'call free without a pointer');
          return produceExprDummyOutput(n, t, {});
        }
        const mergedPointer = mergePointers(pointers, t, { range: n.range, parentBlock: t.memoryContainer });
        free(mergedPointer, t);
        break;
      }
      default:
        console.log('visitCallExpr', n.id, 'unsupported functions');
        return produceExprDummyOutput(n, t, {});
    }
  }

  visitConstantExpr(n: ConstantExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitConstantExpr', n.id);
    return this.visit(n.inner[0], t, this);
  }

  visitDeclRefExpr(
    n: DeclRefExpr,
    t: AnalyzerVisitorContext
  ): string | [MemoryBlock, ...MemoryBlock[]] | [MemoryPointer, ...MemoryPointer[]] | undefined {
    console.log('visitDeclRefExpr', n.id);
    if (n.referencedDecl.kind === 'FunctionDecl') {
      // if it is referencing FunctionDecl (currently only from CallExpr) - return the function name
      return n.referencedDecl.name;
    } else if (n.referencedDecl.kind === 'VarDecl' || n.referencedDecl.kind === 'ParmVarDecl') {
      // otherwise it is referencing an exisiting variable - use id matching
      let entity: MemoryBlock | MemoryPointer | undefined = t.blocks.get(n.referencedDecl.id);
      if (entity) return [entity];
      entity = t.pointers.get(n.referencedDecl.id);
      if (entity) return [entity];
    } else {
      // some other unexpected decls
      console.log('visitDeclRefExpr', n.id, 'unexpected declarations');
    }
  }

  visitExplicitCastExpr(n: ExplicitCastExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitExplicitCastExpr', n.id);
    // for now, assume this is not in scope at all
    return this.visit(n.inner[0], t, this);
  }

  visitImplicitCastExpr(n: ImplicitCastExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitImplicitCastExpr', n.id);

    const castTarget = this.visit(n.inner[0], t, this);
    // function: just pass along the function name
    if (n.castKind === 'FunctionToPointerDecay') {
      return castTarget;
    }

    // memory blocks: change the type and return
    if (areMemoryBlocks(castTarget)) {
      castTarget.forEach((block) => {
        block.type = getActualType(n.type);
      });
      return castTarget;
    }

    // otherwise handle types for allocated block using void pointers
    if (areMemoryPointers(castTarget)) {
      const pointerType = getActualType(n.type);
      const dereferencedType = dereferencedPointerType(pointerType);
      if (!dereferencedType) {
        console.log('visitImplicitCastExpr', n.id, 'invalid type casting type');
        return castTarget;
      }

      castTarget.forEach((pointer) => {
        pointer.type = pointerType;
        pointer.pointsTo.forEach((pointeeId) => {
          const entity = getMemoryBlockOrPointerFromProgramState(pointeeId, t);
          // should only work on block with undefined type (i.e. those allocated on heap)
          if (!isMemoryBlock(entity) || entity.type) {
            return castTarget;
          }

          if (dereferencedPointerType(dereferencedType)) {
            // dereferenced type is still a pointer
            // place a pointer contained in it but leave the block type as undefined
            // Assumes all untyped heap blocks are immediately surrounded by implicitly casts

            if (entity.contains.length > 0) {
              console.log('visitImplicitCastExpr', n.id, 'block has undefined type but has children');
              return castTarget;
            }

            // new pointer
            const pointer = createNewMemoryPointer({
              type: dereferencedType,
              range: entity.range,
              canBeInvalid: true,
              pointedBy: [],
              pointsTo: [],
              parentBlock: entity.id
            });
            t.pointers.set(pointer.id, pointer);
            entity.contains.push(pointer.id);
          } else if (extractedStructType(dereferencedType)) {
            // otherwise - populate its structure
            populateStructBlock(entity, dereferencedType, t);
          } else {
            // just a usual type - change the type
            entity.type = dereferencedType;
          }
        });
      });
    }

    return castTarget;
  }

  visitMemberExpr(
    n: MemberExpr,
    t: AnalyzerVisitorContext
  ): [MemoryBlock, ...MemoryBlock[]] | [MemoryPointer, ...MemoryPointer[]] | void {
    console.log('visitMemberExpr', n.id);
    // Member accessing: clang guarantees type correctness - just need to split based on whether it is the arrow
    const entities = this.visit(n.inner[0], t, this);
    if (n.isArrow && areMemoryPointers(entities)) {
      // a -> b (equivalent to *a.b)
      // get the pointed blocks first
      const blockIds: Set<string> = new Set();
      entities.forEach((pointer) => {
        pointer.pointsTo.forEach((pointeeId) => {
          blockIds.add(pointeeId);
        });
      });

      const result: (MemoryBlock | MemoryPointer)[] = [];
      blockIds.forEach((blockId) => {
        const block = getMemoryBlockFromProgramState(blockId, t);
        // iterate over contains to find the member with matching name
        for (const memberId of block.contains) {
          const child = getMemoryBlockOrPointerFromProgramState(memberId, t);
          if (child.name === n.name) {
            result.push(child);
            break;
          }
        }
      });
      if (areMemoryBlocks(result) || areMemoryPointers(result)) {
        return result;
      }
    } else if (!n.isArrow && areMemoryBlocks(entities)) {
      // a.b
      const result: (MemoryBlock | MemoryPointer)[] = [];
      entities.forEach((block) => {
        // iterate over contains to find the member with matching name
        for (const memberId of block.contains) {
          const child = getMemoryBlockOrPointerFromProgramState(memberId, t);
          if (child.name === n.name) {
            result.push(child);
            break;
          }
        }
      });
      if (areMemoryBlocks(result) || areMemoryPointers(result)) {
        return result;
      }
    }
    console.log('visitMemberExpr', n.id, 'invalid member access');
  }

  visitParenExpr(n: ParenExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitParenExpr', n.id);
    return this.visit(n.inner[0], t, this); // DONE FOR NOW (Thursday, Nov 24)
  }

  visitUnaryExpr(n: UnaryExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitUnaryExpr', n.id);
    // if it is sizeof / alignof (some expr), need to visit the inner
    if (n.inner) return this.visit(n.inner[0], t, this);
    return produceExprDummyOutput(n, t, {});
  }

  /* LITERALS */

  visitCharacterLiteral(n: CharacterLiteral, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitCharacterLiteral', n.id);
    return produceExprDummyOutput(n, t, {});
  }

  visitIntegerLiteral(n: IntegerLiteral, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitIntegerLiteral', n.id);
    return produceExprDummyOutput(n, t, {});
  }

  /* OPERATORS */

  visitBinaryOperator(
    n: BinaryOperator,
    t: AnalyzerVisitorContext
  ): [MemoryBlock, ...MemoryBlock[]] | [MemoryPointer, ...MemoryPointer[]] | void {
    console.log('visitBinaryOperator', n.id);
    // either an assignment, useless, or producing a memory error (in the case of malloc() + 1)
    // https://cloud.kylerich.com/5aIaXl
    if (n.opcode === '=') {
      // ignores type casting entirely
      // assignment: a = b; copy value of b to a, as well as return the assigned value
      // if the assignment is like: a = [c, d], then a can eb assigned the merged result of c and d
      // but if [a, b] = [c, d] (L.H.S. multiple), a = merge of a, c, d due to the possibility of a not being assigned
      // similarly, b = merge of b, c, d
      const lhs = this.visit(n.inner[0], t, this);
      const rhs = this.visit(n.inner[1], t, this);
      if (areMemoryBlocks(lhs) && areMemoryBlocks(rhs)) {
        if (lhs.length === 1) {
          assignMergedBlock(lhs[0], rhs, t);
          return lhs;
        } else {
          const result: MemoryBlock[] = [];
          lhs.forEach((lhsBlock) => {
            assignMergedBlock(lhsBlock, [lhsBlock, ...rhs], t);
            result.push(lhsBlock);
          });
          return result as [MemoryBlock, ...MemoryBlock[]];
        }
      } else if (areMemoryPointers(lhs) && areMemoryPointers(rhs)) {
        // points to is pointer type
        if (lhs.length === 1) {
          assignMergedPointer(lhs[0], rhs, t);
          return lhs;
        } else {
          const result: MemoryPointer[] = [];
          lhs.forEach((lhsPointer) => {
            assignMergedPointer(lhsPointer, [lhsPointer, ...rhs], t);
            result.push(lhsPointer);
          });
          return result as [MemoryPointer, ...MemoryPointer[]];
        }
      } else {
        console.error('visitBinaryOperator', n.id, 'left right type mismatch');
      }
    } else {
      // otherwise, visit left and right and return nothing
      this.visit(n.inner[0], t, this);
      this.visit(n.inner[1], t, this);
    }
  }

  visitCompoundAssignOperator(n: CompoundAssignOperator, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitCompoundAssignOperator', n.id);
    const lhs = this.visit(n.inner[0], t, this);
    this.visit(n.inner[1], t, this);
    if (areMemoryBlocks(lhs)) {
      // if they are memory blocks - just numbers with changed values
      return lhs;
    } else if (areMemoryPointers(lhs)) {
      // if they are memory pointers - invalidate and return them
      const returnList: MemoryPointer[] = [];
      lhs.forEach((pointer) => {
        returnList.push(mergePointers([pointer], t, { range: n.range, parentBlock: t.memoryContainer }));
        invalidatePointer(pointer, t);
      });
      return returnList as [MemoryPointer, ...MemoryPointer[]];
    } else {
      console.error('visitCompoundAssignOperator', n.id, 'LHS is neither list of pointers nor blocks');
      return produceExprDummyOutput(n, t, {});
    }
  }

  visitConditionalOperator(n: ConditionalOperator, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitConditionalOperator', n.id);
    // Visits the condition but don't worry about return value because we are value agnostic of the condition
    this.visit(n.inner[0], t, this);

    // Visits the if statement
    const ifBranchState = cloneProgramState(t);
    createContainer(ifBranchState, 'OpIfBranch');
    this.visit(n.inner[1], ifBranchState, this);
    removeContainer(ifBranchState);

    // Visits the else statement
    const elseBranchState = cloneProgramState(t);
    createContainer(elseBranchState, 'OpElseBranch');
    this.visit(n.inner[2], elseBranchState, this);
    removeContainer(elseBranchState);
    mergeProgramStates(t, [ifBranchState, elseBranchState]);
  }

  visitUnaryOperator(n: UnaryOperator, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitUnaryOperator', n.id);
    const entities = this.visit(n.inner[0], t, this);
    switch (n.opcode) {
      case '!':
      case '-':
        return entities; // just negating some values - ignore
      case '++':
      case '--':
        // if they are pointers (in all other cases, just return entities):
        // if it is prefix (like ++ptr), invalidate the pointers and return them
        // if it is posfix (like ptr++), invalidate the pointers but return copies prior to the invalidation
        if (areMemoryPointers(entities)) {
          if (n.isPostfix) {
            const returnList: MemoryPointer[] = [];
            entities.forEach((pointer) => {
              returnList.push(mergePointers([pointer], t, { range: n.range, parentBlock: t.memoryContainer }));
              invalidatePointer(pointer, t);
            });
            return returnList as [MemoryPointer, ...MemoryPointer[]];
          } else {
            entities.forEach((pointer) => invalidatePointer(pointer, t));
          }
        }
        return entities;
      case '*':
        // if they are not memory pointers - impossible, just skip
        if (!areMemoryPointers(entities)) {
          return entities;
        }

        const type = getActualType(n.type);

        // otherwise, return everything pointed by these pointers
        const pointeeSet = new Set<MemoryPointer | MemoryBlock>();
        entities.forEach((pointer) => {
          pointer.pointsTo.forEach((pointeeId) => {
            const pointee = getMemoryBlockOrPointerFromProgramState(pointeeId, t);
            // based on type after referencing
            if (dereferencedPointerType(type)) {
              // if it is still a pointer type (a.k.a. an indirect pointer is given as the inner)
              // either the actual pointer is there
              // or the pointee is a block with undefined type (explained in ImplicitCastExpr) but contains the actual pointer
              if (isMemoryPointer(pointee)) {
                pointeeSet.add(pointee);
              } else if (isMemoryBlock(pointee) && !pointee.type && pointee.contains.length === 1) {
                pointeeSet.add(getMemoryPointerFromProgramState(pointee.contains[0], t));
              }
            } else {
              // if it is a non-pointer type, pointee should be exactly what we need
              pointeeSet.add(pointee);
            }
          });
        });

        // if all of them are null pointers, skip
        if (pointeeSet.size === 0) {
          return;
        }

        // otherwise, return the pointees
        const pointees = [...pointeeSet];
        return isMemoryBlock(pointees[0])
          ? (pointees as [MemoryBlock, ...MemoryBlock[]])
          : (pointees as [MemoryPointer, ...MemoryPointer[]]);
      case '&':
        // & should only work on entities already in the programState, so just create pointers to them
        if (!areMemoryPointers(entities)) {
          return;
        }

        const pointers: MemoryPointer[] = [];
        entities.forEach((pointee) => {
          const pointer = createNewMemoryPointer({
            type: getActualType(n.type),
            range: n.range,
            canBeInvalid: false,
            pointedBy: [],
            pointsTo: [pointee.id],
            parentBlock: t.memoryContainer
          });
          t.pointers.set(pointer.id, pointer);
          getMemoryBlockFromProgramState(t.memoryContainer, t).contains.push(pointer.id);

          // pointee.pointedBy
          pointee.pointedBy.push([pointer.id, Status.Definitely]);

          pointers.push(pointer);
        });

        return pointers as [MemoryPointer, ...MemoryPointer[]];
    }
  }

  /* STATEMENTS */

  visitBreakStmt(n: BreakStmt, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('breakStmt', n.id);
    t.signal = Signal.Break;
    // return {
    //   shouldBreak: true
    // };
  }

  visitCaseStmt(n: CaseStmt, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    // Dealt with in visitSwitchStmt
    console.error('visitCallStmt should not be called!');
  }

  visitDefaultStmt(n: DefaultStmt, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitDefaultStmt', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitDoStmt(n: DoStmt, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitDoStmt', n.id);

    const states: ProgramState[] = [];
    let tryNextIteration = true;
    let tmpState: ProgramState = t;

    // If loop executes 1, 2 times
    for (let i = 0; i < 2; i++) {
      // Runs at least once, max twice (if no break or return signal are encountered)
      if (!tryNextIteration) break;
      tmpState = cloneProgramState(tmpState);
      states.push(tmpState);
      createContainer(tmpState, 'DoLoop' + i);
      this.visit(n.inner[1], tmpState, this); // loop body
      if (tmpState.signal === Signal.None) {
        this.visit(n.inner[0], tmpState, this); // loop condition
      } else if (tmpState.signal === Signal.Break) {
        tmpState.signal = Signal.None;
        tryNextIteration = false;
      } else if (tmpState.signal === Signal.Return) {
        // Don't change the signal for return
        tryNextIteration = false;
      }
      removeContainer(tmpState);
    }
    mergeProgramStates(t, states as [ProgramState, ...ProgramState[]]);
  }

  visitForStmt(n: ForStmt, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitForStmt', n.id);

    const states: ProgramState[] = [];
    let tryNextIteration = true;

    // If loop executes 0 time
    let tmpState = cloneProgramState(t);
    states.push(tmpState);
    createContainer(tmpState, 'ForLoopZeroTime');
    this.visit(n.inner[0], tmpState, this); // For loop stmt 1, executed exactly 1 time before everything
    this.visit(n.inner[2], tmpState, this); // For loop stmt 2, executed every time before the body has been executed
    removeContainer(tmpState);

    // If loop exectues 1, 2 times
    for (let i = 0; i < 2; i++) {
      // Runs at least once, max twice (if no break or return signal are encountered)
      if (!tryNextIteration) break;
      tmpState = cloneProgramState(tmpState);
      states.push(tmpState);
      createContainer(tmpState, 'ForLoop' + i);
      this.visit(n.inner[4], tmpState, this); // loop body
      if (tmpState.signal === Signal.None) {
        this.visit(n.inner[3], tmpState, this); // For loop stmt 3, exectued every time after body has been executed
        this.visit(n.inner[2], tmpState, this); // For loop stmt 2, executed every time before the body has been executed
      } else if (tmpState.signal === Signal.Break) {
        tmpState.signal = Signal.None;
        tryNextIteration = false;
      } else if (tmpState.signal === Signal.Return) {
        // Don't change the signal for return
        tryNextIteration = false;
      }
      removeContainer(tmpState);
    }
    mergeProgramStates(t, states as [ProgramState, ...ProgramState[]]);
  }

  visitIfStmt(n: IfStmt, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitIfStmt', n.id);

    // Visits the condition but don't worry about return value because we are value agnostic of the condition
    this.visit(n.inner[0], t, this);

    // Visits the if statement
    const ifBranchState = cloneProgramState(t);
    createContainer(ifBranchState, 'IfBranch');
    this.visit(n.inner[1], ifBranchState, this);
    removeContainer(ifBranchState);

    // Visits the else statement
    if (n.hasElse && n.inner[2]) {
      const elseBranchState = cloneProgramState(t);
      createContainer(elseBranchState, 'ElseOrElseIfBranch');
      this.visit(n.inner[2], elseBranchState, this);
      removeContainer(elseBranchState);
      mergeProgramStates(t, [ifBranchState, elseBranchState]);
    } else {
      const elseBranchState = cloneProgramState(t);
      mergeProgramStates(t, [ifBranchState, elseBranchState]);
    }
  }

  visitNullStmt(n: NullStmt, t: AnalyzerVisitorContext): void {
    // no analysis
  }

  visitReturnStmt(n: ReturnStmt, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitReturnStmt', n.id);
    t.signal = Signal.Return;
    if (n.inner) {
      // Inner must be an expression
      const val = this.visit(n.inner[0], t, this) as
        | [MemoryBlock, ...MemoryBlock[]]
        | [MemoryPointer, ...MemoryPointer[]]
        | undefined;
      const outerContainer = Array.from(t.callStack.values()).pop();
      if (areMemoryPointers(val)) {
        mergePointers(val, t, { parentBlock: outerContainer });
        return val;
        // t.returnVals = [mergePointers(val, t, {parentBlock: outerContainer})]
      } else if (areMemoryBlocks(val)) {
        mergeBlocks(val, t, { parentBlock: outerContainer });
        return val;
        // t.returnVals = [mergeBlocks(val, t, {parentBlock: outerContainer})]
      } else {
        console.error('Saw non pointer, block in return');
      }
    }
  }

  visitStmtList(n: StmtList, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitStmtList', n.id);
    if (n.inner) {
      for (const node of n.inner) {
        const val = this.visit(node, t, this);
        // We can always assume that signals will appear in appropriate places
        // i.e loop and switch case contains break
        //     loop contains continue
        //     functions contain returns (so return is always valid)
        if (t.signal !== Signal.None) {
          return val;
        }
      }
    }
  }

  visitSwitchStmt(n: SwitchStmt, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitSwitchStmt', n.id);

    this.visit(n.inner[0], t, this); // For condition

    // Case statements will be in the stmtList

    const switchInnerState = cloneProgramState(t);
    createContainer(switchInnerState, 'SwitchInner');
    const stmtList = n.inner[1];
    let hasBreak = true;
    let currState: ProgramState = switchInnerState; // Will always be assigned first with clone of t in if branch
    const states: ProgramState[] = [];

    let hasDefault = false;

    if (stmtList.inner) {
      for (const node of stmtList.inner) {
        if (node.kind === 'CaseStmt') {
          const caseStmt = node as CaseStmt;
          if (states.length === 0 || hasBreak) {
            // If there was a previous break or this is the first case statement

            const tmpState = cloneProgramState(switchInnerState);
            createContainer(tmpState, `SwitchCase${states.length}`);
            states.push(tmpState);
            currState = tmpState; // Update the current swtich program state

            this.visit(caseStmt.inner[0], currState, this); // For condition
            this.visit(caseStmt.inner[1], currState, this); // For case body

            if (currState.signal === Signal.Break) {
              currState.signal = Signal.None;
              hasBreak = true;
              removeContainer(currState);
            } else if (currState.signal === Signal.Return) {
              hasBreak = true;
              removeContainer(currState);
            } else {
              hasBreak = false;
            }
          } else {
            // We continue to use the previous case's program state
            this.visit(caseStmt.inner[0], currState, this); // For condition
            this.visit(caseStmt.inner[1], currState, this); // For case body

            if (currState.signal === Signal.Break) {
              currState.signal = Signal.None;
              hasBreak = true;
              removeContainer(currState);
            } else if (currState.signal === Signal.Return) {
              hasBreak = true;
              removeContainer(currState);
            }
          }
        } else if (node.kind === 'DefaultStmt') {
          hasDefault = true;
          const defaultStmt = node as DefaultStmt;
          const defaultCaseState = cloneProgramState(switchInnerState);
          createContainer(defaultCaseState, 'SwitchDefault');
          states.push(defaultCaseState);
          this.visit(defaultStmt, defaultCaseState, this);
          if (currState.signal === Signal.Break) {
            currState.signal = Signal.None; // Consume the useless break
          }
          removeContainer(defaultCaseState);
        } else {
          currState.errorCollector.addMemoryError(
            node.range,
            'We only support case statements or default statements in switch! And please include curly brackets around each case body!',
            ErrSeverity.Error
          );
        }
      }
    }
    removeContainer(switchInnerState);

    if (states.length > 0) {
      if (hasDefault) {
        mergeProgramStates(t, states as [ProgramState, ...ProgramState[]]);
      } else {
        mergeProgramStates(t, [t, ...states]);
      }
    }
  }

  visitDeclStmt(n: DeclStmt, t: AnalyzerVisitorContext): void {
    console.log('visitDeclStmt', n.id);
    // visit each declaration in the statement in order - later ones might rely on prior ones
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitWhileStmt(n: WhileStmt, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitWhileStmt', n.id);

    this.visit(n.inner[0], t, this); // For condition

    const states: ProgramState[] = [];
    let tryNextIteration = true;

    // If loop executes 0 time
    let tmpState = cloneProgramState(t);
    states.push(tmpState);
    createContainer(tmpState, 'ForLoopZeroTime');
    this.visit(n.inner[0], tmpState, this); // For loop condition
    removeContainer(tmpState);

    // If loop executes 1, 2 times
    for (let i = 0; i < 2; i++) {
      // Runs at least once, max twice (if no break or return signal are encountered)
      if (!tryNextIteration) break;
      tmpState = cloneProgramState(tmpState);
      states.push(tmpState);
      createContainer(tmpState, 'WhileLoop' + i);
      this.visit(n.inner[1], tmpState, this); // loop body
      if (tmpState.signal === Signal.None) {
        this.visit(n.inner[0], tmpState, this); // loop condition
      } else if (tmpState.signal === Signal.Break) {
        tmpState.signal = Signal.None;
        tryNextIteration = false;
      } else if (tmpState.signal === Signal.Return) {
        // Don't change the signal for return
        tryNextIteration = false;
      }
      removeContainer(tmpState);
    }
    mergeProgramStates(t, states as [ProgramState, ...ProgramState[]]);
  }
}
