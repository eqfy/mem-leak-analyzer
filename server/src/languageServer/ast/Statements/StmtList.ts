import { ASTNode } from '../ASTNode';
import { ASTStmt } from "./ASTStmt";

// represent a list of statements inside a scope enclosed by curly brackets (if, switch, function, explicit scope like {}, ...)
export interface StmtList extends ASTStmt {
    kind: "CompoundStmt";
    inner?: ASTNode[]; // might be missing if there is no statement in it
}

export function isStmtList(node: ASTNode): node is StmtList {
    return node.kind === "CompoundStmt"
}
