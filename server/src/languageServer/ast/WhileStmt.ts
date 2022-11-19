import {ASTNode} from "./ASTNode";

export interface WhileStmt extends ASTNode {
    kind: "WhileStmt";
    inner: ASTNode[];

    /*
while (i = 5) { // expr
    a;
  }
  }
  inner[1] is the statement list (a; in this case)
     */
}

export function isWhileStmt(node: ASTNode): node is WhileStmt {
    return node.kind === "WhileStmt";

}
