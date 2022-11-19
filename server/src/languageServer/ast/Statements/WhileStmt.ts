import { ASTNode } from "../ASTNode";
import { StmtList } from './StmtList';

// represent a while statement
export interface WhileStmt extends ASTNode {
    kind: "WhileStmt";
    inner: [ASTNode, StmtList]; // the condition and the body
}

export function isWhileStmt(node: ASTNode): node is WhileStmt {
    return node.kind === "WhileStmt";
}
