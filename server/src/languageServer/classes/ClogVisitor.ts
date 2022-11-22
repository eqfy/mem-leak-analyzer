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


export class ClogVisitor extends Visitor<void, void> {
  visitAST(n: AST, t: void): void {
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitBinaryOperator(n: BinaryOperator, t: void): void {
    console.log('visitBinaryOperator', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitCallExpr(n: CallExpr, t: void): void {
    console.log('visitCallExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitCaseStmt(n: CaseStmt, t: void): void {
    console.log('visitCallStmt');
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitCharacterLiteral(n: CharacterLiteral, t: void): void {
    console.log('visitCharacterLiteral', n.id);
  }

  visitCompoundAssignOperator(n: CompoundAssignOperator, t: void): void {
    console.log('visitCompoundAssignOperator', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitConditionalOperator(n: ConditionalOperator, t: void): void {
    console.log('visitConditionalOperator', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitConstantExpr(n: ConstantExpr, t: void): void {
    console.log('visitConstantExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitDeclRefExpr(n: DeclRefExpr, t: void): void {
    console.log('visitDeclRefExpr', n.id);
  }

  visitDefaultStmt(n: DefaultStmt, t: void): void {
    console.log('visitDefaultStmt', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitDoStmt(n: DoStmt, t: void): void {
    console.log('visitDoStmt', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitExplicitCastExpr(n: ExplicitCastExpr, t: void): void {
    console.log('visitFunctionDecl', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitForStmt(n: ForStmt, t: void): void {
    console.log('visitForStmt', n.id);
  }

  visitFunctionDecl(n: FunctionDecl, t: void): void {
    console.log('visitFunctionDecl', n.id);
    if (n.inner) {
      for (const node of n.inner) {
        this.visit(node, t, this);
      }
    }
  }

  visitFunctionParamDecl(n: FunctionParamDecl, t: void): void {
    console.log('visitFunctionParamDecl', n.id);
  }

  visitIfStmt(n: IfStmt, t: void): void {
    console.log('visitIfStmt', n.id);
  }

  visitImplicitCastExpr(n: ImplicitCastExpr, t: void): void {
    console.log('visitImplicitCastExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitIntegerLiteral(n: IntegerLiteral, t: void): void {
    console.log('visitIntegerLiteral', n.id);
  }

  visitMemberExpr(n: MemberExpr, t: void): void {
    console.log('visitMemberExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitParenExpr(n: ParenExpr, t: void): void {
    console.log('visitFunctionDecl', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitReturnStmt(n: ReturnStmt, t: void): void {
    console.log('visitReturnStmt', n.id);
  }

  visitStmtList(n: StmtList, t: void): void {
    console.log('visitStmtList', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitStructDecl(n: StructDecl, t: void): void {
    console.log('visitStructDecl', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitStructFieldDecl(n: StructFieldDecl, t: void): void {
    console.log('visitStructFieldDecl', n.id);
  }

  visitSwitchStmt(n: SwitchStmt, t: void): void {
    console.log('visitFunctionDecl', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitUnaryExpr(n: UnaryExpr, t: void): void {
    console.log('visitUnaryExpr', n.id);
  }

  visitUnaryOperator(n: UnaryOperator, t: void): void {
    console.log('visitUnaryExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitVarDecl(n: VarDecl, t: void): void {
    console.log('visitVarDecl', n.id);
  }

  visitVarDeclStmt(n: VarDeclStmt, t: void): void {
    console.log('visitVarDeclStmt', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitWhileStmt(n: WhileStmt, t: void): void {
    console.log('visitWhileStmt', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitBreakStmt(n: BreakStmt, t: void): void {
    console.log('breakStmt', n.id);
  }
}
