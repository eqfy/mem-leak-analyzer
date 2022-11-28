import { ASTNode } from "../ASTNode";
import { StmtList } from './StmtList';
import { ASTStmt } from "./ASTStmt";

// represent a for statement
export interface ForStmt extends ASTStmt {
    kind: "ForStmt";
     /*
        for (int i = 0; i == 5; i ++) { // loop body }
        inner[0] is "int i = 0", executed exactly once before execution of code block
        inner[1] we have no idea, ignore it for now
        inner[2] is i == 5, the condition, executed every time before code block has been executed
        inner[3] is i ++, executed every time after the code block has been executed
        inner[4] (StmtList) is the loop body
     */
    inner: [ASTNode, Record<string, never>, ASTNode, ASTNode, StmtList];
}

export function isForStmt(node: ASTNode): node is ForStmt {
    return node.kind === "ForStmt";

}
