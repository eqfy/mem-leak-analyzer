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
import { FunctionDecl } from '../ast/Declarations/FunctionDecl';
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
  createContainer,
  createNewMemoryBlock,
  createNewMemoryPointer,
  MemoryBlock,
  MemoryPointer,
  mergeProgramStates,
  ProgramState,
  removeBlock,
  Status,
  StructMemberDef
} from './ProgramState';
import { extractStructType, getActualType, isPointerType } from './ASTTypeChecker';
import {
  getMemoryBlocks,
  getMemoryPointers,
  getStructMemberDef,
  areMemoryBlocks,
  areMemoryPointers
} from './VisitorReturnTypeChecker';
import { dumpProgramState } from './ProgramStateDumper';

export type AnalyzerVisitorContext = ProgramState;

export type AnalyzerVisitorReturnType = MemoryBlock[] | MemoryPointer[] | StructMemberDef | string | void;

export class AnalyzerVisitor extends Visitor<AnalyzerVisitorContext, AnalyzerVisitorReturnType> {
  visitAST(n: AST, t: AnalyzerVisitorContext): void {
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
    console.log('Final program state:');
    console.log(dumpProgramState(t));
  }

  /* DECLARATIONS */

  // might visit AST first round to collect the function declarations to populate some function tables
  visitFunctionDecl(n: FunctionDecl, t: AnalyzerVisitorContext): void {
    console.log('visitFunctionDecl', n.id);
    if (n.inner) {
      for (const node of n.inner) {
        this.visit(node, t, this);
      }
    }
  }

  visitFunctionParamDecl(n: FunctionParamDecl, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitFunctionParamDecl', n.id);
  }

  visitStructDecl(n: StructDecl, t: AnalyzerVisitorContext): void {
    // collect all the members
    const members = n.inner.map((node: StructFieldDecl) => getStructMemberDef(this.visit(node, t, this)));
    // record the struct definition in the program state
    addStructDef({ structDefs: t.structDefs, name: n.name, id: n.id, range: n.range, members: members });
  }

  visitStructFieldDecl(n: StructFieldDecl, t: AnalyzerVisitorContext): StructMemberDef {
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
    if (!n.inner) {
      // if it has no child (meaning no initialization), store it to be a pointer / memory block based on type
      if (isPointerType(n.type)) {
        const pointer = createNewMemoryPointer({
          id: n.id,
          name: n.name,
          type: getActualType(n.type),
          range: n.range,
          parentBlock: t.memoryContainer
        });
        t.pointers.set(n.id, pointer);
      } else {
        const block = createNewMemoryBlock({
          id: n.id,
          name: n.name,
          type: getActualType(n.type),
          range: n.range,
          parentBlock: t.memoryContainer
        });
        t.blocks.set(n.id, block);
      }
    // } else {
    //   // based on assigned value, determine whether it is a pointer or block
    //   const container = this.createContainer(t);
    //   let children = this.visit(n.inner[0], { ...t, memoryContainer: container }, this);

    //   if (areMemoryPointers(children)) {
    //     children = getMemoryPointers(children);
    //     // copy the pointer, add changes to the id and names, and that it is not pointed by anything
    //     const pointer = createNewMemoryPointer({
    //       id: n.id,
    //       name: n.name,
    //       type: child.type,
    //       range: n.range,
    //       canBeInvalid: child.canBeInvalid,
    //       pointedBy: [],
    //       pointsTo: [...child.pointsTo],
    //       parentBlock: t.memoryContainer
    //     });
    //     t.pointers.set(n.id, pointer);

    //     // also need to change the things it points to, to now be pointed by this as well (bidrectional)
    //     const status = pointer.canBeInvalid || pointer.pointsTo.length > 1 ? Status.Maybe : Status.Definitely;
    //     for (const pointeeId in pointer.pointsTo) {
    //       if (t.blocks.has(pointeeId)) {
    //         const pointee = t.blocks.get(pointeeId);
    //         if (pointee) pointee.pointedBy.push([pointer.id, status]);
    //       } else if (t.pointers.has(pointeeId)) {
    //         const pointee = t.pointers.get(pointeeId);
    //         if (pointee) pointee.pointedBy.push([pointer.id, status]);
    //       }
    //     }
    //   } else if (isMemoryBlock(child)) {
    //     child = getMemoryBlock(child);
    //     // copy the block, add changes to the id and names, and that it is not pointed by anything
    //     const block = createNewMemoryBlock({
    //       id: n.id,
    //       name: n.name,
    //       type: child.type,
    //       range: n.range,
    //       existence: child.existence,
    //       pointedBy: [],
    //       contains: [...child.contains],
    //       parentBlock: t.memoryContainer
    //     });
    //     t.blocks.set(n.id, block);

    //     // the original block now contains nothing
    //     child.contains = [];

    //     // also need to change the things it contains, to now have this as a new parent (bidrectional)
    //     for (const containeeId in block.contains) {
    //       if (t.blocks.has(containeeId)) {
    //         const containee = t.blocks.get(containeeId);
    //         if (containee) containee.parentBlock = block.id;
    //       } else if (t.pointers.has(containeeId)) {
    //         const containee = t.pointers.get(containeeId);
    //         if (containee) containee.parentBlock = block.id;
    //       }
    //     }
    //   }

    //   // finally, clean up the container
    //   this.cleanupContainer(container, t);
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
        // unsupported funtions
        return;
    }
    // visit the arguments
    for (const node of n.inner.slice(1)) {
      this.visit(node, t, this);
    }
  }

  visitConstantExpr(n: ConstantExpr, t: AnalyzerVisitorContext): void {
    return; // DONE FOR NOW (Thursday, Nov 24)
  }

  visitDeclRefExpr(n: DeclRefExpr, t: AnalyzerVisitorContext): string | MemoryBlock[] | MemoryPointer[] | undefined {
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
      console.log('visitDeclRefExpr', n.id);
    }
  }

  visitExplicitCastExpr(n: ExplicitCastExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    return this.visit(n.inner[0], t, this); // DONE FOR NOW (Thursday, Nov 24)
  }

  visitImplicitCastExpr(n: ImplicitCastExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    return this.visit(n.inner[0], t, this); // DONE FOR NOW (Thursday, Nov 24)
  }

  visitMemberExpr(n: MemberExpr, t: AnalyzerVisitorContext): MemoryBlock[] | MemoryPointer[] {
    // Member accessing: clang guarantees type correctness - just need to split based on whether it is the arrow
    
    // let children = this.visit(n.inner[0], t, this);
    // if (n.isArrow && isMemoryPointer(child)) {
    //   // a -> b
      

    // } else {
    //   // a.b
    // }
    return [];

  }

  visitParenExpr(n: ParenExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    return this.visit(n.inner[0], t, this); // DONE FOR NOW (Thursday, Nov 24)
  }

  visitUnaryExpr(n: UnaryExpr, t: AnalyzerVisitorContext): void {
    // if it is sizeof / alignof (some expr), need to visit the inner
    if (n.inner) {
      for (const node of n.inner) {
        const result = this.visit(node, t, this);
      }
    }
  }

  /* LITERALS */

  visitCharacterLiteral(n: CharacterLiteral, t: AnalyzerVisitorContext): void {
    return; // DONE FOR NOW (Thursday, Nov 24)
  }

  visitIntegerLiteral(n: IntegerLiteral, t: AnalyzerVisitorContext): void {
    return; // DONE FOR NOW (Thursday, Nov 24)
  }

  /* OPERATORS */

  visitBinaryOperator(n: BinaryOperator, t: AnalyzerVisitorContext): MemoryBlock[] | MemoryPointer[] | void {
    // either an assignment, useless, or producing a memory error (in the case of malloc() + 1)
    // https://cloud.kylerich.com/5aIaXl
    if (n.opcode === '=') {
      // assignment: TODO
    } else {
      // other binary operators: just visit left and right
      const left = this.visit(n.inner[0], t, this);
      const right = this.visit(n.inner[1], t, this);
    }
  }

  visitCompoundAssignOperator(n: CompoundAssignOperator, t: AnalyzerVisitorContext): void {
    console.log('visitCompoundAssignOperator', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitConditionalOperator(n: ConditionalOperator, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    // returns anything // TODO, to be considered similar to IF
  }

  visitUnaryOperator(n: UnaryOperator, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    // returns anything
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
    t.memoryContainer = createContainer(t)
    if (n.inner) {
      for (const node of n.inner) {
        this.visit(node, t, this);
      }
    }
    removeBlock(t.memoryContainer, t)
  }

  visitSwitchStmt(n: SwitchStmt, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitFunctionDecl', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitDeclStmt(n: DeclStmt, t: AnalyzerVisitorContext): void {
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
