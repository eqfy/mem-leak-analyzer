import { ASTNode } from '../ASTNode';
import { ASTStmt } from "./ASTStmt";

// represent a null statement (a statement with no content, simply a semicolon ;)
export interface NullStmt extends ASTStmt {
    kind: "NullStmt";
}

export function isNullStmt(node: ASTNode): node is NullStmt {
    return node.kind === "NullStmt";
}
