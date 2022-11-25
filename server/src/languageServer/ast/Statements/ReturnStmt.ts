import { ASTNode, ASTNodeWithType } from "../ASTNode";
import { ASTStmt } from "./ASTStmt";

// represent a return statement
export interface ReturnStmt extends ASTStmt {
    kind: "ReturnStmt";
    inner?: [ASTNode] // optional return value
}

export function isReturnStmt(node: ASTNode): node is ReturnStmt {
    return node.kind === "ReturnStmt";
}
