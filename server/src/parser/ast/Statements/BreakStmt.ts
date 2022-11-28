import { ASTNode } from "../ASTNode";
import { ASTStmt } from "./ASTStmt";

// represent a break statement inside a switch
export interface BreakStmt extends ASTStmt {
    kind: "BreakStmt";
}

export function isBreakStmt(node: ASTNode): node is BreakStmt {
    return node.kind === "BreakStmt";
}
