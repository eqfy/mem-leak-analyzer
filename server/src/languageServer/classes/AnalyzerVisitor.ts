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
import { VarDeclStmt } from '../ast/Statements/VarDeclStmt';
import { StructFieldDecl } from '../ast/Declarations/StructFieldDecl';
import { DeclRefExpr } from '../ast/Expressions/DeclRefExpr';
import { ParenExpr } from '../ast/Expressions/ParenExpr';
import { StructDecl } from '../ast/Declarations/StructDecl';
import { ReturnStmt } from '../ast/Statements/ReturnStmt';
import { StmtList } from '../ast/Statements/StmtList';
import { CharacterLiteral } from '../ast/Literals/CharacterLiteral';
import { BreakStmt } from '../ast/Statements/BreakStmt';
import { addStructDef, MemoryBlock, MemoryPointer, ProgramState, StructMember } from './ProgramState';
import { extractStructType } from './ASTTypeChecker';
import { getStructMember } from './VisitorReturnTypeChecker';
import { dumpProgramState } from './ProgramStateDumper';

export type AnalyzerVisitorContext = ProgramState;

export type AnalyzerVisitorReturnType = MemoryBlock | MemoryPointer | StructMember | void;

export class AnalyzerVisitor extends Visitor<AnalyzerVisitorContext, AnalyzerVisitorReturnType> {
  visitAST(n: AST, t: AnalyzerVisitorContext): void {
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
    console.log("Final program state:");
    console.log(dumpProgramState(t));
  }

  /* DECLARATIONS */

  visitFunctionDecl(n: FunctionDecl, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType { //void
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
    const members = n.inner.map((node: StructFieldDecl) => getStructMember(this.visit(node, t, this)));
    // record the struct definition in the program state
    addStructDef({structDefs: t.structDefs, name: n.name, range: n.range, members: members});
  }

  visitStructFieldDecl(n: StructFieldDecl, t: AnalyzerVisitorContext): StructMember {
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

  visitVarDecl(n: VarDecl, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitVarDecl', n.id);
  }

  /* EXPRESSIONS */

  visitCallExpr(n: CallExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType { // returns anything that is a analyzer return type
    console.log('visitCallExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitConstantExpr(n: ConstantExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    return;  // DONE FOR NOW (Thursday, Nov 24)
  }

  visitDeclRefExpr(n: DeclRefExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitDeclRefExpr', n.id);
  }

  visitExplicitCastExpr(n: ExplicitCastExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    return this.visit(n.inner[0], t, this); // DONE FOR NOW (Thursday, Nov 24)
  }

  visitImplicitCastExpr(n: ImplicitCastExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    return this.visit(n.inner[0], t, this); // DONE FOR NOW (Thursday, Nov 24)
  }

  visitMemberExpr(n: MemberExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    // TODO
  }

  visitParenExpr(n: ParenExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    return this.visit(n.inner[0], t, this); // DONE FOR NOW (Thursday, Nov 24)
  }

  visitUnaryExpr(n: UnaryExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType { // for now, just leave this. will focus on later (especially for variable inputs). think of argtype as inner
    return; // DONE FOR NOW (Thursday, Nov 24)
  }

  /* LITERALS */

  visitCharacterLiteral(n: CharacterLiteral, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    return; // DONE FOR NOW (Thursday, Nov 24)
  }

  visitIntegerLiteral(n: IntegerLiteral, t: AnalyzerVisitorContext): void {
    return; // DONE FOR NOW (Thursday, Nov 24)
  }

  /* OPERATORS */

  visitBinaryOperator(n: BinaryOperator, t: AnalyzerVisitorContext): undefined {
    // either an assignment, useless, or producing a memory error (in the case of malloc() + 1)
    // https://cloud.kylerich.com/5aIaXl
    return undefined;
  }

  visitCompoundAssignOperator(n: CompoundAssignOperator, t: AnalyzerVisitorContext): undefined {
    console.log('visitCompoundAssignOperator', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
    return undefined;
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

  visitVarDeclStmt(n: VarDeclStmt, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitVarDeclStmt', n.id);
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
}
