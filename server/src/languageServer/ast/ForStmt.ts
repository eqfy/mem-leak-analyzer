import {ASTNode} from "./ASTNode";

export interface ForStmt extends ASTNode {
    kind: "ForStmt";
    inner: ASTNode[];

    /*
    for (i; i = 5; i ++) { // expr, <NULL>, expr, expr
    a;
  }
  inner[4] is the statement list (a; in this case)
     */
}

export function isForStmt(node: ASTNode): node is ForStmt {
    return node.kind === "ForStmt";

}
