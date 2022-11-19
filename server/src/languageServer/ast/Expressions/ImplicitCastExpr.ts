import { ASTNode, ASTNodeWithType } from "../ASTNode";

// represent an implicit type casting expression
export interface ImplicitCastExpr extends ASTNodeWithType {
    kind: "ImplicitCastExpr";
    castKind: string;
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    inner: [ASTNode]; // the ASTNode to apply type casting on
}

export function isImplicitCastExpr(node: ASTNode): node is ImplicitCastExpr {
    return node.kind === "ImplicitCastExpr";
}
