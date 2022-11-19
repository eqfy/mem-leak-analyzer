import { ASTNode } from '../ASTNode';

// represent a list of statements inside a scope enclosed by curly brackets (if, switch, function, explicit scope like {}, ...)
export interface StmtList extends ASTNode {
    kind: "CompoundStmt";
    inner: ASTNode[];
}

export function isStmtList(node: ASTNode): node is StmtList {
    return node.kind === "CompoundStmt" 
}
