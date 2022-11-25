import { ASTNode } from "../ASTNode";
import { ASTStmt } from "./ASTStmt";

// represent a default statement inside a switch
export interface DefaultStmt extends ASTStmt {
    kind: "DefaultStmt";
    inner: [ASTNode];
}

export function isDefaultStmt(node: ASTNode): node is DefaultStmt {
    return node.kind === "DefaultStmt";
}
