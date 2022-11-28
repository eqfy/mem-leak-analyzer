import { Visitor } from './Visitor';
import { AST } from '../ast/AST';
import { FunctionParamDecl } from '../ast/Declarations/FunctionParamDecl';
import { DefaultStmt } from '../ast/Statements/DefaultStmt';
import { CompoundAssignOperator } from '../ast/Operators/CompoundAssignOperator';
import { MemberExpr } from '../ast/Expressions/MemberExpr';
import { VarDecl } from '../ast/Declarations/VarDecl';
import { WhileStmt } from '../ast/Statements/WhileStmt';
import { ImplicitCastExpr } from '../ast/Expressions/ImplicitCastExpr';
import { CallExpr } from '../ast/Expressions/CallExpr';
import { BinaryOperator } from '../ast/Operators/BinaryOperator';
import { UnaryOperator } from '../ast/Operators/UnaryOperator';
import { ExplicitCastExpr } from '../ast/Expressions/ExplicitCastExpr';
import { ForStmt } from '../ast/Statements/ForStmt';
import { DoStmt } from '../ast/Statements/DoStmt';
import { IntegerLiteral } from '../ast/Literals/IntegerLiteral';
import { SwitchStmt } from '../ast/Statements/SwitchStmt';
import { ConditionalOperator } from '../ast/Operators/ConditionalOperator';
import { CaseStmt } from '../ast/Statements/CaseStmt';
import { ConstantExpr } from '../ast/Expressions/ConstantExpr';
import { UnaryExpr } from '../ast/Expressions/UnaryExpr';
import { FunctionDecl, isFunctionDecl } from '../ast/Declarations/FunctionDecl';
import { IfStmt } from '../ast/Statements/IfStmt';
import { NullStmt } from '../ast/Statements/NullStmt';
import { DeclStmt } from '../ast/Statements/DeclStmt';
import { StructFieldDecl } from '../ast/Declarations/StructFieldDecl';
import { DeclRefExpr } from '../ast/Expressions/DeclRefExpr';
import { ParenExpr } from '../ast/Expressions/ParenExpr';
import { StructDecl } from '../ast/Declarations/StructDecl';
import { ReturnStmt } from '../ast/Statements/ReturnStmt';
import { StmtList } from '../ast/Statements/StmtList';
import { CharacterLiteral } from '../ast/Literals/CharacterLiteral';
import { BreakStmt } from '../ast/Statements/BreakStmt';
import {
  addStructDef,
  areMemoryBlocks,
  areMemoryPointers,
  createContainer,
  createNewMemoryBlock,
  createNewMemoryPointer,
  getMemoryBlockFromProgramState,
  getMemoryBlockOrPointerFromProgramState,
  isMemoryBlock,
  isMemoryPointer,
  MemoryBlock,
  MemoryPointer,
  mergeBlocks,
  mergePointers,
  mergeProgramStates,
  ProgramState,
  removeBlock,
  removeContainer,
  Status,
  StructMemberDef
} from './ProgramState';
import { extractStructType, getActualType, isPointerType } from './ASTTypeChecker';
import { getStructMemberDef } from './VisitorReturnTypeChecker';
import { dumpProgramState } from './ProgramStateDumper';
import { FUNCTION_NAME_MAIN } from '../constants';

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
    // iterate over once to collect all the functions into the function table
    for (const node of n.inner) {
      if (isFunctionDecl(node)) {
        t.functions.set(node.name, node);
      }
    }
    // then iterate again and visit everything (including the struct declarations, global variables) except the non-main functions
    for (const node of n.inner) {
      if (isFunctionDecl(node) && node.name !== FUNCTION_NAME_MAIN) {
        this.visit(node, t, this);
      }
    }
    console.log('Final program state:');
    console.log(dumpProgramState(t));
  }

  /* DECLARATIONS */

  visitFunctionDecl(n: FunctionDecl, t: AnalyzerVisitorContext): void {
    console.log('visitFunctionDecl', n.id);
    if (n.inner) {
      // create a temporary scope for visiting params and body
      createContainer(t);
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
    const type = extractStructType(n.type);
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
      if (isPointerType(n.type)) {
        const pointer = createNewMemoryPointer(configuration);
        t.pointers.set(n.id, pointer);
      } else {
        const block = createNewMemoryBlock(configuration);
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
    if (typeof functionName !== 'string') return;

    if (t.functions.has(functionName)) {
      // TODO: calls to custom functions
    }
    switch (functionName) {
      case 'malloc':
      case 'calloc':
      case 'realloc':
      case 'align_alloc':
        // TODO: memory allocation
        break;
      case 'free':
        // TODO: free
        break;
      default:
        console.log('visitCallExpr', n.id, 'unsupported functions');
        return;
    }
    // visit the arguments
    for (const node of n.inner.slice(1)) {
      this.visit(node, t, this);
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
    return this.visit(n.inner[0], t, this); // DONE FOR NOW (Thursday, Nov 24)
  }

  visitImplicitCastExpr(n: ImplicitCastExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitImplicitCastExpr', n.id);
    return this.visit(n.inner[0], t, this); // DONE FOR NOW (Thursday, Nov 24)
  }

  visitMemberExpr(
    n: MemberExpr,
    t: AnalyzerVisitorContext
  ): [MemoryBlock, ...MemoryBlock[]] | [MemoryPointer, ...MemoryPointer[]] {
    console.log('visitMemberExpr', n.id);
    // Member accessing: clang guarantees type correctness - just need to split based on whether it is the arrow
    let entities = this.visit(n.inner[0], t, this);
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
    return [createNewMemoryBlock({})];
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
  ): [MemoryBlock, ...MemoryBlock[]] | [MemoryPointer, ...MemoryPointer[]] {
    console.log('visitBinaryOperator', n.id);
    // either an assignment, useless, or producing a memory error (in the case of malloc() + 1)
    // https://cloud.kylerich.com/5aIaXl
    if (n.opcode === '=') {
      // assignment: a = b; copy value of b to a, as well as return the assigned value
      const lhs = this.visit(n.inner[0], t, this);
      const rhs = this.visit(n.inner[1], t, this);
      // TODO: implement
      return [createNewMemoryPointer({})];
    } else {
      // otherwise, visit left and right - and return a block or pointer based on type
      this.visit(n.inner[0], t, this);
      this.visit(n.inner[1], t, this);
      const configuration = {
        type: getActualType(n.type),
        range: n.range,
        parentBlock: t.memoryContainer
      };

      if (isPointerType(n.type)) {
        return [createNewMemoryPointer(configuration)];
      } else {
        return [createNewMemoryBlock(configuration)];
      }
    }
  }

  visitCompoundAssignOperator(n: CompoundAssignOperator, t: AnalyzerVisitorContext): void {
    console.log('visitCompoundAssignOperator', n.id);
    // TODO: implement
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitConditionalOperator(n: ConditionalOperator, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitConditionalOperator', n.id);
    // returns anything // TODO, to be considered similar to IF
  }

  visitUnaryOperator(n: UnaryOperator, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitUnaryOperator', n.id);
    // TODO: implement
  }

  /* STATEMENTS */

  visitBreakStmt(n: BreakStmt, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('breakStmt', n.id);
  }

  visitCaseStmt(n: CaseStmt, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitCallStmt');
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitDefaultStmt(n: DefaultStmt, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitDefaultStmt', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitDoStmt(n: DoStmt, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitDoStmt', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitForStmt(n: ForStmt, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitForStmt', n.id);
  }

  visitIfStmt(n: IfStmt, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitIfStmt', n.id);
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
        this.visit(node, t, this);
      }
    }
  }

  visitSwitchStmt(n: SwitchStmt, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitFunctionDecl', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
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
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  /* HELPERS */
}
