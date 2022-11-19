import {AST} from "../ast/AST";
import {VarDecl} from "../ast/VarDecl";

export interface Visitor<T = void, U = void> {
    visitAST(n: AST, t: T): U;
    visitVarDecl(n: VarDecl, t: T): U;
    visitRecordDecl(n: object, t: T): U; // "RecordDecl" === Struct Declaration
    visitFieldDecl(n: object, t: T): U; // "FieldDecl" inside "RecordDecl"
    visitFunctionDecl(n: object, t: T): U;
    visitParmVarDecl(n: object, t: T): U; // "ParmVarDecl inside "FunctionDecl"
    visitCompoundStmt(n: object, t: T): U; // list of statements inside "FunctionDecl" // also used for scoping
    visitDeclStmt(n: object, t: T): U; // some type of declaration inside "FunctionDecl
    visitImplicitCastExpr(n: object, t: T): U; //
    visitDeclRefExpr(n: object, t: T): U; //
    visitBinaryOperator(n: object, t: T): U; // used for assigning variables?
    visitMemberExpr(n: object, t: T): U;
    visitIntegralCast(n: object, t: T): U;
    visitCharacterLiteral(n: object, t: T): U;
    visitUnaryOperator(n: object, t: T): U;
}
