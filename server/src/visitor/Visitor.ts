import { AST } from '../parser/ast/AST';
import { ASTNode } from '../parser/ast/ASTNode';
import { FunctionDecl } from '../parser/ast/Declarations/FunctionDecl';
import { FunctionParamDecl } from '../parser/ast/Declarations/FunctionParamDecl';
import { StructDecl } from '../parser/ast/Declarations/StructDecl';
import { StructFieldDecl } from '../parser/ast/Declarations/StructFieldDecl';
import { VarDecl } from '../parser/ast/Declarations/VarDecl';
import { CallExpr } from '../parser/ast/Expressions/CallExpr';
import { ConstantExpr } from '../parser/ast/Expressions/ConstantExpr';
import { DeclRefExpr } from '../parser/ast/Expressions/DeclRefExpr';
import { ExplicitCastExpr } from '../parser/ast/Expressions/ExplicitCastExpr';
import { ImplicitCastExpr } from '../parser/ast/Expressions/ImplicitCastExpr';
import { MemberExpr } from '../parser/ast/Expressions/MemberExpr';
import { ParenExpr } from '../parser/ast/Expressions/ParenExpr';
import { UnaryExpr } from '../parser/ast/Expressions/UnaryExpr';
import { CharacterLiteral } from '../parser/ast/Literals/CharacterLiteral';
import { IntegerLiteral } from '../parser/ast/Literals/IntegerLiteral';
import { BinaryOperator } from '../parser/ast/Operators/BinaryOperator';
import { CompoundAssignOperator } from '../parser/ast/Operators/CompoundAssignOperator';
import { ConditionalOperator } from '../parser/ast/Operators/ConditionalOperator';
import { UnaryOperator } from '../parser/ast/Operators/UnaryOperator';
import { CaseStmt } from '../parser/ast/Statements/CaseStmt';
import { DefaultStmt } from '../parser/ast/Statements/DefaultStmt';
import { DoStmt } from '../parser/ast/Statements/DoStmt';
import { ForStmt } from '../parser/ast/Statements/ForStmt';
import { IfStmt } from '../parser/ast/Statements/IfStmt';
import { NullStmt } from '../parser/ast/Statements/NullStmt';
import { ReturnStmt } from '../parser/ast/Statements/ReturnStmt';
import { StmtList } from '../parser/ast/Statements/StmtList';
import { SwitchStmt } from '../parser/ast/Statements/SwitchStmt';
import { DeclStmt } from '../parser/ast/Statements/DeclStmt';
import { WhileStmt } from '../parser/ast/Statements/WhileStmt';
import { BreakStmt } from '../parser/ast/Statements/BreakStmt';

export abstract class Visitor<T = void, U = void> {
  visitMap: BetterMap<string, (n: any, t: T, v: Visitor<T, U>) => U> = new BetterMap();

  constructor() {
    this.visitMap.set('FunctionDecl', (n: FunctionDecl, t: T, v: Visitor<T, U>) => v.visitFunctionDecl(n, t));
    this.visitMap.set('ParmVarDecl', (n: FunctionParamDecl, t: T, v: Visitor<T, U>) => v.visitFunctionParamDecl(n, t));
    this.visitMap.set('RecordDecl', (n: StructDecl, t: T, v: Visitor<T, U>) => v.visitStructDecl(n, t));
    this.visitMap.set('FieldDecl', (n: StructFieldDecl, t: T, v: Visitor<T, U>) => v.visitStructFieldDecl(n, t));
    this.visitMap.set('VarDecl', (n: VarDecl, t: T, v: Visitor<T, U>) => v.visitVarDecl(n, t));

    this.visitMap.set('CallExpr', (n: CallExpr, t: T, v: Visitor<T, U>) => v.visitCallExpr(n, t));
    this.visitMap.set('ConstantExpr', (n: ConstantExpr, t: T, v: Visitor<T, U>) => v.visitConstantExpr(n, t));
    this.visitMap.set('DeclRefExpr', (n: DeclRefExpr, t: T, v: Visitor<T, U>) => v.visitDeclRefExpr(n, t));
    this.visitMap.set('CStyleCastExpr', (n: ExplicitCastExpr, t: T, v: Visitor<T, U>) => v.visitExplicitCastExpr(n, t));
    this.visitMap.set('ImplicitCastExpr', (n: ImplicitCastExpr, t: T, v: Visitor<T, U>) => v.visitImplicitCastExpr(n, t));
    this.visitMap.set('MemberExpr', (n: MemberExpr, t: T, v: Visitor<T, U>) => v.visitMemberExpr(n, t));
    this.visitMap.set('ParenExpr', (n: ParenExpr, t: T, v: Visitor<T, U>) => v.visitParenExpr(n, t));
    this.visitMap.set('UnaryExprOrTypeTraitExpr', (n: UnaryExpr, t: T, v: Visitor<T, U>) => v.visitUnaryExpr(n, t));

    this.visitMap.set('CharacterLiteral', (n: CharacterLiteral, t: T, v: Visitor<T, U>) => v.visitCharacterLiteral(n, t));
    this.visitMap.set('IntegerLiteral', (n: IntegerLiteral, t: T, v: Visitor<T, U>) => v.visitIntegerLiteral(n, t));

    this.visitMap.set('BinaryOperator', (n: BinaryOperator, t: T, v: Visitor<T, U>) => v.visitBinaryOperator(n, t));
    this.visitMap.set('CompoundAssignOperator', (n: CompoundAssignOperator, t: T, v: Visitor<T, U>) =>
      v.visitCompoundAssignOperator(n, t)
    );
    this.visitMap.set('ConditionalOperator', (n: ConditionalOperator, t: T, v: Visitor<T, U>) =>
      v.visitConditionalOperator(n, t)
    );
    this.visitMap.set('UnaryOperator', (n: UnaryOperator, t: T, v: Visitor<T, U>) => v.visitUnaryOperator(n, t));

    this.visitMap.set('BreakStmt', (n: BreakStmt, t: T, v: Visitor<T, U>) => v.visitBreakStmt(n, t));
    this.visitMap.set('CaseStmt', (n: CaseStmt, t: T, v: Visitor<T, U>) => v.visitCaseStmt(n, t));
    this.visitMap.set('DefaultStmt', (n: DefaultStmt, t: T, v: Visitor<T, U>) => v.visitDefaultStmt(n, t));
    this.visitMap.set('DoStmt', (n: DoStmt, t: T, v: Visitor<T, U>) => v.visitDoStmt(n, t));
    this.visitMap.set('ForStmt', (n: ForStmt, t: T, v: Visitor<T, U>) => v.visitForStmt(n, t));
    this.visitMap.set('IfStmt', (n: IfStmt, t: T, v: Visitor<T, U>) => v.visitIfStmt(n, t));
    this.visitMap.set('NullStmt', (n: NullStmt, t: T, v: Visitor<T, U>) => v.visitNullStmt(n, t));
    this.visitMap.set('ReturnStmt', (n: ReturnStmt, t: T, v: Visitor<T, U>) => v.visitReturnStmt(n, t));
    this.visitMap.set('CompoundStmt', (n: StmtList, t: T, v: Visitor<T, U>) => v.visitStmtList(n, t));
    this.visitMap.set('SwitchStmt', (n: SwitchStmt, t: T, v: Visitor<T, U>) => v.visitSwitchStmt(n, t));
    this.visitMap.set('DeclStmt', (n: DeclStmt, t: T, v: Visitor<T, U>) => v.visitDeclStmt(n, t));
    this.visitMap.set('WhileStmt', (n: WhileStmt, t: T, v: Visitor<T, U>) => v.visitWhileStmt(n, t));
    this.visitMap.set('C group9 ast', (n: AST, t: T, v: Visitor<T, U>) => v.visitAST(n, t));
  }

  visit<T, U>(n: ASTNode, t: T, v: Visitor<T, U>): U {
    return v.visitMap.definitelyGet(n.kind)(n, t, v);
  }

  abstract visitFunctionDecl(n: FunctionDecl, t: T): U;
  abstract visitFunctionParamDecl(n: FunctionParamDecl, t: T): U;
  abstract visitStructDecl(n: StructDecl, t: T): U;
  abstract visitStructFieldDecl(n: StructFieldDecl, t: T): U;
  abstract visitVarDecl(n: VarDecl, t: T): U;

  abstract visitCallExpr(n: CallExpr, t: T): U;
  abstract visitConstantExpr(n: ConstantExpr, t: T): U;
  abstract visitDeclRefExpr(n: DeclRefExpr, t: T): U;
  abstract visitExplicitCastExpr(n: ExplicitCastExpr, t: T): U;
  abstract visitImplicitCastExpr(n: ImplicitCastExpr, t: T): U;
  abstract visitMemberExpr(n: MemberExpr, t: T): U;
  abstract visitParenExpr(n: ParenExpr, t: T): U;
  abstract visitUnaryExpr(n: UnaryExpr, t: T): U;

  abstract visitCharacterLiteral(n: CharacterLiteral, t: T): U;
  abstract visitIntegerLiteral(n: IntegerLiteral, t: T): U;

  abstract visitBinaryOperator(n: BinaryOperator, t: T): U;
  abstract visitCompoundAssignOperator(n: CompoundAssignOperator, t: T): U;
  abstract visitConditionalOperator(n: ConditionalOperator, t: T): U;
  abstract visitUnaryOperator(n: UnaryOperator, t: T): U;

  abstract visitBreakStmt(n: BreakStmt, t: T): U;
  abstract visitCaseStmt(n: CaseStmt, t: T): U;
  abstract visitDefaultStmt(n: DefaultStmt, t: T): U;
  abstract visitDoStmt(n: DoStmt, t: T): U;
  abstract visitForStmt(n: ForStmt, t: T): U;
  abstract visitIfStmt(n: IfStmt, t: T): U;
  abstract visitNullStmt(n: NullStmt, t: T): U;
  abstract visitReturnStmt(n: ReturnStmt, t: T): U;
  abstract visitStmtList(n: StmtList, t: T): U;
  abstract visitSwitchStmt(n: SwitchStmt, t: T): U;
  abstract visitDeclStmt(n: DeclStmt, t: T): U;
  abstract visitWhileStmt(n: WhileStmt, t: T): U;

  abstract visitAST(n: AST, t: T): U;
}

class BetterMap<K, F> extends Map<K, F> {
  definitelyGet(key: K): F {
    const val = super.get(key);
    if (val) {
      return val;
    } else {
      throw new Error('ast kind not found' + key);
    }
  }
}
