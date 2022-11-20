// import {Visitor} from "./Visitor";
// import {AST} from "../ast/AST";
// import {FunctionParamDecl} from "../ast/Declarations/FunctionParamDecl";
// import {DefaultStmt} from "../ast/Statements/DefaultStmt";
// import {CompoundAssignOperator} from "../ast/Operators/CompoundAssignOperator";
// import {MemberExpr} from "../ast/Expressions/MemberExpr";
// import {VarDecl} from "../ast/Declarations/VarDecl";
// import {WhileStmt} from "../ast/Statements/WhileStmt";
// import {ImplicitCastExpr} from "../ast/Expressions/ImplicitCastExpr";
// import {CallExpr} from "../ast/Expressions/CallExpr";
// import {BinaryOperator} from "../ast/Operators/BinaryOperator";
// import {UnaryOperator} from "../ast/Operators/UnaryOperator";
// import {ExplicitCastExpr} from "../ast/Expressions/ExplicitCastExpr";
// import {ForStmt} from "../ast/Statements/ForStmt";
// import {DoStmt} from "../ast/Statements/DoStmt";
// import {IntegerLiteral} from "../ast/Literals/IntegerLiteral";
// import {SwitchStmt} from "../ast/Statements/SwitchStmt";
// import {ConditionalOperator} from "../ast/Operators/ConditionalOperator";
// import {CaseStmt} from "../ast/Statements/CaseStmt";
// import {ConstantExpr} from "../ast/Expressions/ConstantExpr";
// import {UnaryExpr} from "../ast/Expressions/UnaryExpr";
// import {FunctionDecl} from "../ast/Declarations/FunctionDecl";
// import {IfStmt} from "../ast/Statements/IfStmt";
// import {VarDeclStmt} from "../ast/Statements/VarDeclStmt";
// import {StructFieldDecl} from "../ast/Declarations/StructFieldDecl";
// import {DeclRefExpr} from "../ast/Expressions/DeclRefExpr";
// import {ParenExpr} from "../ast/Expressions/ParenExpr";
// import {StructDecl} from "../ast/Declarations/StructDecl";
// import {ReturnStmt} from "../ast/Statements/ReturnStmt";
// import {StmtList} from "../ast/Statements/StmtList";
// import {CharacterLiteral} from "../ast/Literals/CharacterLiteral";
// import {BreakStmt} from "../ast/Statements/BreakStmt";
//
// export class AnalyzerVisitor extends Visitor<void, void> {
//     visitAST(n: AST, t: void): void {
//         for (const node of n.inner) {
//             this.visit(node, t, this);
//         }
//     }
// }
