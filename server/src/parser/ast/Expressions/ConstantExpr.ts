import { ASTNode, ASTNodeWithType } from "../ASTNode";
import { ASTExpr } from "./ASTExpr";

// represent a constant expression (most likely an expression wrapper around integer and character literals)
export interface ConstantExpr extends ASTExpr {
    kind: "ConstantExpr";
    inner: [ASTNodeWithType]; // The single literal enclosed
}

export function isConstantExpr(node: ASTNode): node is ConstantExpr {
    return node.kind === "ConstantExpr";
}
