import {ASTNode, ASTNodeWithType} from "./ASTNode";
import {DeclRefExpr} from "./DeclRefExpr";
import {CStyleCastExpr} from "./CStyleCastExpr";
import {UnaryOperator} from "./UnaryOperator";
import {ParenExpr} from "./ParenExpr";
import {IntegerLiteral} from "./IntegerLiteral";
import {ImplicitCastExpr} from "./ImplicitCastExpr";
import {CallExpr} from "./CallExpr";

export interface ReturnStmt extends ASTNodeWithType {
    kind: "ReturnStmt";
    inner: (ASTNodeWithType)[]; // len = 1
}

export function isReturnStmt(node: ASTNode): node is ReturnStmt {
    return node.kind === "ReturnStmt";
}
