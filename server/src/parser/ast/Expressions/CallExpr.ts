import { ASTNode } from "../ASTNode";
import { ASTExpr } from "./ASTExpr";

// represent a function call expression
export interface CallExpr extends ASTExpr {
    kind: "CallExpr";
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    inner: [ASTNode, ...ASTNode[]] // referenced function followed a list of arguments
}

export function isCallExpr(node: ASTNode): node is CallExpr {
    return node.kind === "CallExpr"
}
