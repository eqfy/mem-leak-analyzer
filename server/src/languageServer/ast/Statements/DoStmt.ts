import { ASTNode } from "../ASTNode";
import { StmtList } from './StmtList';

// represent a do...while statement
export interface DoStmt extends ASTNode {
    kind: "DoStmt";
    inner: [StmtList, ASTNode]; // the loop body and condition
}

export function isDoStmt(node: ASTNode): node is DoStmt {
    return node.kind === "DoStmt";
}
