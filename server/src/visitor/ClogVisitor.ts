import { Visitor } from './Visitor';
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
import { FunctionDecl } from '../parser/ast/Declarations/FunctionDecl';
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

export class ClogVisitor extends Visitor<void, void> {
  visitAST(n: AST, t: void): void {
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  /* DECLARATIONS */

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

  visitStructDecl(n: StructDecl, t: void): void {
    console.log('visitStructDecl', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitStructFieldDecl(n: StructFieldDecl, t: void): void {
    console.log('visitStructFieldDecl', n.id);
  }

  visitVarDecl(n: VarDecl, t: void): void {
    console.log('visitVarDecl', n.id);
  }

  /* EXPRESSIONS */

  visitCallExpr(n: CallExpr, t: void): void {
    console.log('visitCallExpr', n.id);
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

  visitExplicitCastExpr(n: ExplicitCastExpr, t: void): void {
    console.log('visitExplicitCastExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitImplicitCastExpr(n: ImplicitCastExpr, t: void): void {
    console.log('visitImplicitCastExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitMemberExpr(n: MemberExpr, t: void): void {
    console.log('visitMemberExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitParenExpr(n: ParenExpr, t: void): void {
    console.log('visitParenExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitUnaryExpr(n: UnaryExpr, t: void): void {
    console.log('visitUnaryExpr', n.id);
    if (n.inner) {
      for (const node of n.inner) {
        this.visit(node, t, this);
      }
    }
  }

  /* LITERALS */

  visitCharacterLiteral(n: CharacterLiteral, t: void): void {
    console.log('visitCharacterLiteral', n.id);
  }

  visitIntegerLiteral(n: IntegerLiteral, t: void): void {
    console.log('visitIntegerLiteral', n.id);
  }

  /* OPERATORS */

  visitBinaryOperator(n: BinaryOperator, t: void): void {
    console.log('visitBinaryOperator', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
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

  visitUnaryOperator(n: UnaryOperator, t: void): void {
    console.log('visitUnaryExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  /* STATEMENTS */

  visitBreakStmt(n: BreakStmt, t: void): void {
    console.log('breakStmt', n.id);
  }

  visitCaseStmt(n: CaseStmt, t: void): void {
    console.log('visitCallStmt');
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
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

  visitForStmt(n: ForStmt, t: void): void {
    console.log('visitForStmt', n.id);
  }

  visitIfStmt(n: IfStmt, t: void): void {
    console.log('visitIfStmt', n.id);
  }

  visitNullStmt(n: NullStmt, t: void): void {
    console.log('visitNullStmt', n.id);
  }

  visitReturnStmt(n: ReturnStmt, t: void): void {
    console.log('visitReturnStmt', n.id);
  }

  visitStmtList(n: StmtList, t: void): void {
    console.log('visitStmtList', n.id);
    if (n.inner) {
      for (const node of n.inner) {
        this.visit(node, t, this);
      }
    }
  }

  visitSwitchStmt(n: SwitchStmt, t: void): void {
    console.log('visitFunctionDecl', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitDeclStmt(n: DeclStmt, t: void): void {
    console.log('visitDeclStmt', n.id);
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
}
