import {ASTNode} from "./ASTNode";
import {StmtList} from "./StmtList";

export interface IfStmt extends ASTNode {
    kind: "IfStmt";
    inner: ASTNode[]; // [0] is the condition, [1] is the body, [2] is the else (or else if) body or block
    hasElse: boolean; // if [2] is a compound statement (statement list), then its an else block. otherwise it is a else if (which is essentially treated the exacct same as an if statement - when looking at the ast, there is no way to telse the difference

}

export function isIfStmt(node: ASTNode): node is IfStmt {
    return node.kind === "IfStmt";

}


//inner: [ASTNode, StmtList, IfStmt | StmtList]; // [0] is the condition, [1] is the body, [2] is the else (or else if) body or block
