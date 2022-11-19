import { ASTNode, ASTNodeWithType } from "../ASTNode";

// represent a function call expression
export interface CallExpr extends ASTNodeWithType {
    kind: "CallExpr";
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    inner: [ASTNode, ...ASTNode[]] // referenced function followed a list of arguments
}

export function isCallExpr(node: ASTNode): node is CallExpr {
    return node.kind === "CallExpr"
}
