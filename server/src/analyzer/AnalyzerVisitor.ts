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
  addStructDef,
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
  removeBlock,
  removeContainer,
  StructMemberDef,
  free,
  Status,
  allocate,
  assignMergedBlock,
  assignMergedPointer,
  invalidatePointer
} from './ProgramState';
import { dereferencedPointerType, extractStructType, getActualType } from '../parser/ast/ASTTypeChecker';
import { getStructMemberDef } from '../visitor/VisitorReturnTypeChecker';
import { dumpProgramState } from './ProgramStateDumper';
import { FUNCTION_NAME_MAIN, NONE_BLOCK_ID } from '../constants';

export type AnalyzerVisitorContext = ProgramState;

export type AnalyzerVisitorReturnType =
  | [MemoryBlock, ...MemoryBlock[]]
  | [MemoryPointer, ...MemoryPointer[]]
  | StructMemberDef
  | string
  | AnalyzerVisitorReturnContext
  | void;

export interface AnalyzerVisitorReturnContext {
  block?: [MemoryBlock, ...MemoryBlock[]];
  pointer?: [MemoryPointer, ...MemoryPointer[]];
  structMemberDef?: StructMemberDef;
  string?: string;
  shouldBreak?: boolean;
}

export class AnalyzerVisitor extends Visitor<AnalyzerVisitorContext, AnalyzerVisitorReturnType> {
  visitAST(n: AST, t: AnalyzerVisitorContext): void {
    console.log('visitAST');
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

  visitFunctionDecl(n: FunctionDecl, t: AnalyzerVisitorContext): void {
    console.log('visitFunctionDecl', n.id);
    if (n.inner) {
      // create a temporary scope for visiting params and body
      createContainer(t, n.name);
      for (const node of n.inner) {
        this.visit(node, t, this);
      }
      removeContainer(t);
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
    addStructDef({ structDefs: t.structDefs, name: n.name, id: n.id, range: n.range, members: members });
  }

  visitStructFieldDecl(n: StructFieldDecl, t: AnalyzerVisitorContext): StructMemberDef {
    console.log('visitStructFieldDecl', n.id);
    const type = extractStructType(getActualType(n.type));
    // if it is a field of type struct
    if (type) {
      const structDef = t.structDefs.get(type);
      // should always have the corresponding struct already defined in the program state
      if (structDef) {
        return [n.name, n.range, structDef[0][0]];
      }
    }
    return [n.name, n.range, undefined];
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

    if (!n.inner) {
      // if it has no child (meaning no initialization), store it to be a pointer / memory block based on type
      if (dereferencedPointerType(getActualType(n.type))) {
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
      return;
    }

    if (t.functions.has(functionName)) {
      // custom functions in function table: visit the arguments and record in the programState
      n.inner.slice(1).forEach((child) => {
        const entities = this.visit(child, t, this);
        if (areMemoryBlocks(entities)) {
          t.arguments.push(mergeBlocks(entities, t, {}).id);
        } else if (areMemoryPointers(entities)) {
          t.arguments.push(mergePointers(entities, t, {}).id);
        } else {
          console.log('visitCallExpr', n.id, 'function arguments are neither blocks nor pointers');
          return;
        }
      });

      // if function has been visited once - skip visiting
      if (t.callStack.has(functionName)) {
        t.arguments = [];
        return; // FIXME: return value
      }
      // otherwise visit the FunctionDecl
      t.callStack.add(functionName);
      const functionDecl = t.functions.get(functionName);
      if (functionDecl) {
        return this.visit(functionDecl, t, this);
      }
      return;
    }
    switch (functionName) {
      case 'malloc':
      case 'calloc':
      case 'realloc':
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
          return;
        }
        const mergedPointer = mergePointers(pointers, t, {range: n.range});
        free(mergedPointer, t);
        break;
      }
      default:
        console.log('visitCallExpr', n.id, 'unsupported functions');
        return;
    }
  }

  visitConstantExpr(n: ConstantExpr, t: AnalyzerVisitorContext): void {
    console.log('visitConstantExpr', n.id);
    // DONE FOR NOW (Thursday, Nov 24)
  }

  visitDeclRefExpr(
    n: DeclRefExpr,
    t: AnalyzerVisitorContext
  ): string | [MemoryBlock, ...MemoryBlock[]] | [MemoryPointer, ...MemoryPointer[]] | undefined {
    console.log('visitDeclRefExpr', n.id);
    if (n.referencedDecl.kind === 'FunctionDecl') {
      // if it is referencing FunctionDecl (currently only from CallExpr) - return the function name
      return n.referencedDecl.name;
    } else if (n.referencedDecl.kind === 'VarDecl') {
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
    return this.visit(n.inner[0], t, this); // DONE FOR NOW (Thursday, Nov 24)
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
        block.type = n.id;
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
            // remove the heap block and replace it with a pointer
            // Assumes all untyped heap blocks are immediately surrounded by implicitly casts

            if (entity.contains.length > 0 || entity.pointedBy.length > 1) {
              console.log(
                'visitImplicitCastExpr',
                n.id,
                'block has undefined type but has children or is pointed by multiple pointers'
              );
              return castTarget;
            }

            t.blocks.delete(entity.id);

            const newEntity = createNewMemoryPointer({
              id: entity.id,
              name: entity.name,
              type: dereferencedType,
              range: entity.range,
              canBeInvalid: true,
              pointedBy: entity.pointedBy,
              pointsTo: [],
              parentBlock: undefined
            });
            t.pointers.set(newEntity.id, newEntity);
          } else if (extractStructType(dereferencedType)) {
            // extracted type is a struct - populate its structure
            // TODO
          } else {
            // just a usual type - change the type
            entity.type = dereferencedType;
          }
        });
      });

      return castTarget;
    }
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

  visitUnaryExpr(n: UnaryExpr, t: AnalyzerVisitorContext): void {
    console.log('visitUnaryExpr', n.id);
    // if it is sizeof / alignof (some expr), need to visit the inner
    if (n.inner) this.visit(n.inner[0], t, this);
  }

  /* LITERALS */

  visitCharacterLiteral(n: CharacterLiteral, t: AnalyzerVisitorContext): void {
    console.log('visitCharacterLiteral', n.id);
    // DONE FOR NOW (Thursday, Nov 24)
  }

  visitIntegerLiteral(n: IntegerLiteral, t: AnalyzerVisitorContext): void {
    console.log('visitIntegerLiteral', n.id);
    // DONE FOR NOW (Thursday, Nov 24)
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
      // ignores type casting entirely, for now TODO
      // assignment: a = b; copy value of b to a, as well as return the assigned value
      const lhs = this.visit(n.inner[0], t, this);
      const rhs = this.visit(n.inner[1], t, this);
      // assumes LHS is variable
      if (areMemoryBlocks(lhs) && areMemoryBlocks(rhs)) {
        const id = lhs[0].id;
        assignMergedBlock(lhs[0], rhs, t);
        return [t.blocks.get(id) as MemoryBlock];
      } else if (areMemoryPointers(lhs) && areMemoryPointers(rhs)) {
        // points to is pointer type
        const id = lhs[0].id;
        assignMergedPointer(lhs[0], rhs, t);
        return [t.pointers.get(id) as MemoryPointer];
      } else {
        // lhs is not a pointer or memory block?
      }
    } else if (n.opcode === '+') {
      // addition: a += b
      const lhs = this.visit(n.inner[0], t, this);
      return [createNewMemoryPointer({})];
    } else {
      // otherwise, visit left and right and return nothing
      this.visit(n.inner[0], t, this);
      this.visit(n.inner[1], t, this);
    }
  }

  visitCompoundAssignOperator(n: CompoundAssignOperator, t: AnalyzerVisitorContext): void {
    console.log('visitCompoundAssignOperator', n.id); // TODO: implement
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitConditionalOperator(n: ConditionalOperator, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitConditionalOperator', n.id);
    // Visits the condition but don't worry about return value because we are value agnostic of the condition
    this.visit(n.inner[0], t, this);

    // Visits the if statement
    const ifBranchState = cloneProgramState(t);
    createContainer(ifBranchState, "OpIfBranch");
    this.visit(n.inner[1], ifBranchState, this);
    removeContainer(ifBranchState);

    // Visits the else statement
    const elseBranchState = cloneProgramState(t);
    createContainer(elseBranchState, "OpElseBranch");
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
        // if they are not memory pointers, just skip
        if (!areMemoryPointers(entities)) {
          return entities;
        }

        // otherwise, return everything pointed by these pointers
        const pointeeSet = new Set<MemoryPointer | MemoryBlock>();
        entities.forEach((pointer) => {
          pointer.pointsTo.forEach((pointeeId) => {
            pointeeSet.add(getMemoryBlockOrPointerFromProgramState(pointeeId, t));
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
        entities.forEach(pointee => {
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
    return {
      shouldBreak: true
    };
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

    // If loop executes 1 time
    const oneTimeState = cloneProgramState(t);
    createContainer(oneTimeState, 'DoLoopOneTime');
    this.visit(n.inner[1], oneTimeState, this); // For loop body
    this.visit(n.inner[0], oneTimeState, this); // For condition
    removeContainer(oneTimeState);

    // If loop executes 2 time
    const twoTimeState = cloneProgramState(t);
    createContainer(twoTimeState, 'DoLoopTwoTime');
    this.visit(n.inner[1], twoTimeState, this); // For loop body
    this.visit(n.inner[0], twoTimeState, this); // For condition
    this.visit(n.inner[1], twoTimeState, this); // For loop body
    this.visit(n.inner[0], twoTimeState, this); // For condition
    removeContainer(twoTimeState);

    mergeProgramStates(t, [oneTimeState, twoTimeState]);
  }

  visitForStmt(n: ForStmt, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitForStmt', n.id);

    // We check three cases for loops, if it is executed zero times, once or twice.
    // If loop executes 0 time
    const zeroTimeState = cloneProgramState(t);
    createContainer(zeroTimeState, 'ForLoopZeroTime');
    this.visit(n.inner[0], zeroTimeState, this); // For loop stmt 1, executed exactly 1 time before everything
    this.visit(n.inner[2], zeroTimeState, this); // For loop stmt 2, executed every time before the body has been executed
    removeContainer(zeroTimeState);

    // If loop executes 1 time
    const oneTimeState = cloneProgramState(t);
    createContainer(oneTimeState, 'ForLoopOneTime');
    this.visit(n.inner[0], oneTimeState, this); // For loop stmt 1, executed exactly 1 time before everything
    this.visit(n.inner[2], oneTimeState, this); // For loop stmt 2, executed every time before the body has been executed
    this.visit(n.inner[4], oneTimeState, this); // For loop body
    this.visit(n.inner[3], oneTimeState, this); // For loop stmt 3, exectued every time after body has been executed
    this.visit(n.inner[2], oneTimeState, this); // For loop stmt 2, executed every time before the body has been executed
    removeContainer(oneTimeState);

    // If loop executes 2 times
    const twoTimeState = cloneProgramState(t);
    createContainer(twoTimeState, 'ForLoopTwoTime');
    this.visit(n.inner[0], twoTimeState, this); // For loop stmt 1, executed exactly 1 time before everything
    this.visit(n.inner[2], twoTimeState, this); // For loop stmt 2, executed every time before the body has been executed
    this.visit(n.inner[4], twoTimeState, this); // For loop body
    this.visit(n.inner[3], twoTimeState, this); // For loop stmt 3, exectued every time after body has been executed
    this.visit(n.inner[2], twoTimeState, this); // For loop stmt 2, executed every time before the body has been executed
    this.visit(n.inner[4], twoTimeState, this); // For loop body
    this.visit(n.inner[3], twoTimeState, this); // For loop stmt 3, exectued every time after body has been executed
    this.visit(n.inner[2], twoTimeState, this); // For loop stmt 2, executed every time before the body has been executed
    removeContainer(twoTimeState);

    mergeProgramStates(t, [zeroTimeState, oneTimeState, twoTimeState]);
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
  }

  visitStmtList(n: StmtList, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitStmtList', n.id);
    if (n.inner) {
      for (const node of n.inner) {
        const retVal = this.visit(node, t, this);
        // We can always assume that break, continue will be in loops and case, default will be in switch
        if (retVal && typeof retVal === 'object' && 'shouldBreak' in retVal && retVal.shouldBreak) {
          return retVal;
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
            const retVal = this.visit(caseStmt.inner[1], currState, this); // For case body

            if (retVal && typeof retVal === 'object' && 'shouldBreak' in retVal && retVal.shouldBreak) {
              hasBreak = true;
              removeContainer(currState);
            } else {
              hasBreak = false;
            }
          } else {
            // We continue to use the previous case's program state
            this.visit(caseStmt.inner[0], currState, this); // For condition
            const retVal = this.visit(caseStmt.inner[1], currState, this); // For case body
            if (retVal && typeof retVal === 'object' && 'shouldBreak' in retVal && retVal.shouldBreak) {
              hasBreak = true;
              removeContainer(currState);
            }
          }
        } else if (node.kind === 'DefaultStmt') {
          const defaultStmt = node as DefaultStmt;
          const defaultCaseState = cloneProgramState(switchInnerState);
          createContainer(defaultCaseState, 'SwitchDefault');
          states.push(defaultCaseState);
          this.visit(defaultStmt, defaultCaseState, this);
          removeContainer(defaultCaseState);
        } else {
          console.error("Encountered a non case or default statement in switch - we currently don't support this");
        }
      }
    }
    removeContainer(switchInnerState);

    if (states.length > 0) {
      mergeProgramStates(t, states as [ProgramState, ...ProgramState[]]);
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

    // If loop executes 0 time
    const zeroTimeState = cloneProgramState(t);

    // If loop executes 1 time
    const oneTimeState = cloneProgramState(t);
    createContainer(oneTimeState, 'WhileOneTime');
    this.visit(n.inner[1], oneTimeState, this); // For loop body
    this.visit(n.inner[0], oneTimeState, this); // For condition
    removeContainer(oneTimeState);

    // If loop executes 2 time
    const twoTimeState = cloneProgramState(t);
    createContainer(twoTimeState, 'WhileTwoTime');
    this.visit(n.inner[1], twoTimeState, this); // For loop body
    this.visit(n.inner[0], twoTimeState, this); // For condition
    this.visit(n.inner[1], twoTimeState, this); // For loop body
    this.visit(n.inner[0], twoTimeState, this); // For condition
    removeContainer(twoTimeState);

    mergeProgramStates(t, [zeroTimeState, oneTimeState, twoTimeState]);
  }
}
