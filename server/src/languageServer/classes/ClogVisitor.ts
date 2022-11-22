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
import { VarDeclStmt } from '../ast/Statements/VarDeclStmt';
import { StructFieldDecl } from '../ast/Declarations/StructFieldDecl';
import { DeclRefExpr } from '../ast/Expressions/DeclRefExpr';
import { ParenExpr } from '../ast/Expressions/ParenExpr';
import { StructDecl } from '../ast/Declarations/StructDecl';
import { ReturnStmt } from '../ast/Statements/ReturnStmt';
import { StmtList } from '../ast/Statements/StmtList';
import { CharacterLiteral } from '../ast/Literals/CharacterLiteral';
import { BreakStmt } from '../ast/Statements/BreakStmt';
import { ProgramState } from "./ProgramState";

interface CLogVisitorContext {
  ProgramState: ProgramState
}

type CLogVisitorReturnType = ProgramState | void;

export class ClogVisitor extends Visitor<CLogVisitorContext, CLogVisitorReturnType> {
  visitAST(n: AST, t: CLogVisitorContext): void {
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitBinaryOperator(n: BinaryOperator, t: CLogVisitorContext): void {
    console.log('visitBinaryOperator', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitCallExpr(n: CallExpr, t: CLogVisitorContext): void {
    console.log('visitCallExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitCaseStmt(n: CaseStmt, t: CLogVisitorContext): void {
    console.log('visitCallStmt');
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitCharacterLiteral(n: CharacterLiteral, t: CLogVisitorContext): void {
    console.log('visitCharacterLiteral', n.id);
  }

  visitCompoundAssignOperator(n: CompoundAssignOperator, t: CLogVisitorContext): void {
    console.log('visitCompoundAssignOperator', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitConditionalOperator(n: ConditionalOperator, t: CLogVisitorContext): void {
    console.log('visitConditionalOperator', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitConstantExpr(n: ConstantExpr, t: CLogVisitorContext): void {
    console.log('visitConstantExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitDeclRefExpr(n: DeclRefExpr, t: CLogVisitorContext): void {
    console.log('visitDeclRefExpr', n.id);
  }

  visitDefaultStmt(n: DefaultStmt, t: CLogVisitorContext): void {
    console.log('visitDefaultStmt', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitDoStmt(n: DoStmt, t: CLogVisitorContext): void {
    console.log('visitDoStmt', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitExplicitCastExpr(n: ExplicitCastExpr, t: CLogVisitorContext): void {
    console.log('visitFunctionDecl', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitForStmt(n: ForStmt, t: CLogVisitorContext): void {
    console.log('visitForStmt', n.id);
  }

  visitFunctionDecl(n: FunctionDecl, t: CLogVisitorContext): void {
    console.log('visitFunctionDecl', n.id);
    if (n.inner) {
      for (const node of n.inner) {
        this.visit(node, t, this);
      }
    }
  }

  visitFunctionParamDecl(n: FunctionParamDecl, t: CLogVisitorContext): void {
    console.log('visitFunctionParamDecl', n.id);
  }

  visitIfStmt(n: IfStmt, t: CLogVisitorContext): void {
    console.log('visitIfStmt', n.id);
  }

  visitImplicitCastExpr(n: ImplicitCastExpr, t: CLogVisitorContext): void {
    console.log('visitImplicitCastExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitIntegerLiteral(n: IntegerLiteral, t: CLogVisitorContext): void {
    console.log('visitIntegerLiteral', n.id);
  }

  visitMemberExpr(n: MemberExpr, t: CLogVisitorContext): void {
    console.log('visitMemberExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitParenExpr(n: ParenExpr, t: CLogVisitorContext): void {
    console.log('visitFunctionDecl', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitReturnStmt(n: ReturnStmt, t: CLogVisitorContext): void {
    console.log('visitReturnStmt', n.id);
  }

  visitStmtList(n: StmtList, t: CLogVisitorContext): void {
    console.log('visitStmtList', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitStructDecl(n: StructDecl, t: CLogVisitorContext): void {
    console.log('visitStructDecl', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitStructFieldDecl(n: StructFieldDecl, t: CLogVisitorContext): void {
    console.log('visitStructFieldDecl', n.id);
  }

  visitSwitchStmt(n: SwitchStmt, t: CLogVisitorContext): void {
    console.log('visitFunctionDecl', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitUnaryExpr(n: UnaryExpr, t: CLogVisitorContext): void {
    console.log('visitUnaryExpr', n.id);
  }

  visitUnaryOperator(n: UnaryOperator, t: CLogVisitorContext): void {
    console.log('visitUnaryExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitVarDecl(n: VarDecl, t: CLogVisitorContext): void {
    console.log('visitVarDecl', n.id);
  }

  visitVarDeclStmt(n: VarDeclStmt, t: CLogVisitorContext): void {
    console.log('visitVarDeclStmt', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitWhileStmt(n: WhileStmt, t: CLogVisitorContext): void {
    console.log('visitWhileStmt', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitBreakStmt(n: BreakStmt, t: CLogVisitorContext): void {
    console.log('breakStmt', n.id);
  }
}
