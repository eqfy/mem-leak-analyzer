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
import { ProgramState, StructMember } from './ProgramState';
import { extractStructType } from '../typeChecker';

type AnalyzerVisitorContext = ProgramState;

type AnalyzerVisitorReturnType = MemoryBlock | MemoryPointer | StructMember | undefined | void;

export class AnalyzerVisitor extends Visitor<AnalyzerVisitorContext, AnalyzerVisitorReturnType> {
  visitAST(n: AST, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  /* DECLARATIONS */

  visitFunctionDecl(n: FunctionDecl, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
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

  visitStructDecl(n: StructDecl, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitStructDecl', n.id);
    for (const node of n.inner) {
      const member = this.visit(node, t, this);

    }
  }

  visitStructFieldDecl(n: StructFieldDecl, t: AnalyzerVisitorContext): StructMember {
    console.log('visitStructFieldDecl', n.id);
    const type = extractStructType(n.type);
    if (type && t.structDefs.has(type)) {
        // should always have the corresponding struct defined, if it is a struct typed member
        const structDef = t.structDefs.get(type);
        return [n.name, n.range, undefined];
    }
    return [n.name, n.range, undefined];
  }

  visitVarDecl(n: VarDecl, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitVarDecl', n.id);
  }

  /* EXPRESSIONS */

  visitCallExpr(n: CallExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitCallExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitConstantExpr(n: ConstantExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitConstantExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitDeclRefExpr(n: DeclRefExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitDeclRefExpr', n.id);
  }

  visitExplicitCastExpr(n: ExplicitCastExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitExplicitCastExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitImplicitCastExpr(n: ImplicitCastExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitImplicitCastExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitMemberExpr(n: MemberExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitMemberExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitParenExpr(n: ParenExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitParenExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitUnaryExpr(n: UnaryExpr, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitUnaryExpr', n.id);
  }

  /* LITERALS */

  visitCharacterLiteral(n: CharacterLiteral, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitCharacterLiteral', n.id);
  }

  visitIntegerLiteral(n: IntegerLiteral, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitIntegerLiteral', n.id);
  }

  /* OPERATORS */

  visitBinaryOperator(n: BinaryOperator, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitBinaryOperator', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitCompoundAssignOperator(n: CompoundAssignOperator, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitCompoundAssignOperator', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitConditionalOperator(n: ConditionalOperator, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitConditionalOperator', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
  }

  visitUnaryOperator(n: UnaryOperator, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitUnaryExpr', n.id);
    for (const node of n.inner) {
      this.visit(node, t, this);
    }
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

  visitNullStmt(n: NullStmt, t: AnalyzerVisitorContext): AnalyzerVisitorReturnType {
    console.log('visitNullStmt', n.id);
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
