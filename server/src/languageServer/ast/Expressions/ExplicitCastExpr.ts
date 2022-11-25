import { ASTNode } from "../ASTNode";
import { ASTExpr } from "./ASTExpr";

// represent an explicit type casting expression
export interface ExplicitCastExpr extends ASTExpr {
    kind: "CstyleCastExpr";
    castKind: string;
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    inner: [ASTNode]; // the ASTNode to apply type casting on
}

export function isExplicitCastExpr(node: ASTNode): node is ExplicitCastExpr {
    return node.kind === "CStyleCastExpr"
}
