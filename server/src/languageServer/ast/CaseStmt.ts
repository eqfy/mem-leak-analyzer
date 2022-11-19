import {ASTNode} from "./ASTNode";

export interface CaseStmt extends ASTNode {
    kind: "CaseStmt";
    inner: ASTNode[]; // [0] is the constantExpr, [1] is the body
}

export function isCaseStmt(node: ASTNode): node is CaseStmt {
    return node.kind === "CaseStmt";

}
