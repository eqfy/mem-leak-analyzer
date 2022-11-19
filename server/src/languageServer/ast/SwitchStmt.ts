import {ASTNode} from "./ASTNode";

export interface SwitchStmt extends ASTNode {
    kind: "SwitchStmt";
    inner: ASTNode[]; // [0] is the condition, [1] is the body
}

export function isSwitchStmt(node: ASTNode): node is SwitchStmt {
    return node.kind === "SwitchStmt";

}
