import {ASTNode} from "./ASTNode";

export interface DoStmt extends ASTNode {
    kind: "DoStmt";
    inner: ASTNode[];

    /*
  do {
    a;
  } while (i = 5); // expr

  inner[0] is the statement list (a; in this case)
     */
}

export function isDoStmt(node: ASTNode): node is DoStmt {
    return node.kind === "DoStmt";
}
