import {ASTNode, ASTNodeWithType} from "./ASTNode";
import {DeclRefExpr} from "./DeclRefExpr";
import {CastingExpression} from "./CastingExpression";
import {UnaryOperator} from "./UnaryOperator";
import {ParenExpr} from "./ParenExpr";
import {IntegerLiteral} from "./IntegerLiteral";
import {ImplicitCastExpr} from "./ImplicitCastExpr";
import {CallExpr} from "./CallExpr";

export interface ReturnStmt extends ASTNodeWithType {
    kind: "ReturnStmt";
    inner: ASTNode[]; // len = 1
}

export function isReturnStmt(node: ASTNode): node is ReturnStmt {
    return node.kind === "ReturnStmt";
}
