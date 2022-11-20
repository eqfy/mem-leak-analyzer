import { ASTNode } from "../ASTNode";
import { StmtList } from './StmtList';
import {ASTStmt} from "./ASTStmt";

// represent a for statement
export interface ForStmt extends ASTStmt {
    kind: "ForStmt";
     /*
        for (int i = 0; i == 5; i ++) { // loop body }
        inner[0] is "int i = 0"
        inner[1] we have no idea, ignore it for now
        inner[2] is i == 5
        inner[3] is i ++
        inner[4] (StmtList) is the loop body
     */
    inner: [ASTNode, {}, ASTNode, ASTNode, StmtList];
}

export function isForStmt(node: ASTNode): node is ForStmt {
    return node.kind === "ForStmt";

}
