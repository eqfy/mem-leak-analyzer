import { ASTNode } from "../ASTNode";
import { ASTExpr } from "./ASTExpr";

// represents an expression enclosed in a pair of parentheses
export interface ParenExpr extends ASTExpr {
    kind: "ParenExpr";
    inner: ASTNode[];
}

export function isParenExpr(node: ASTNode): node is ParenExpr {
    return node.kind === "ParenExpr";
}
