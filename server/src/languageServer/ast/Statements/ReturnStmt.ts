import { ASTNode, ASTNodeWithType } from "../ASTNode";

// represent a return statement
export interface ReturnStmt extends ASTNodeWithType {
    kind: "ReturnStmt";
    inner?: [ASTNode] // optional return value
}

export function isReturnStmt(node: ASTNode): node is ReturnStmt {
    return node.kind === "ReturnStmt";
}
