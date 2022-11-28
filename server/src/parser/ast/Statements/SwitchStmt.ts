import { ASTNode } from "../ASTNode";
import { StmtList } from './StmtList';
import { ASTStmt } from "./ASTStmt";

// represent a switch statement
export interface SwitchStmt extends ASTStmt {
    kind: "SwitchStmt";
    inner: [ASTNode, StmtList]; // the condition and the body
}

export function isSwitchStmt(node: ASTNode): node is SwitchStmt {
    return node.kind === "SwitchStmt";

}
