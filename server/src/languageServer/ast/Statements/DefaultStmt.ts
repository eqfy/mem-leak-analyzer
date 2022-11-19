import { ASTNode } from "../ASTNode";
import { ConstantExpr } from '../Expressions/ConstantExpr';

// represent a default statement inside a switch
export interface DefaultStmt extends ASTNode {
    kind: "DefaultStmt";
    inner: [ConstantExpr, ASTNode]; // the constant expr used in case matching and whatever followed
}

export function isDefaultStmt(node: ASTNode): node is DefaultStmt {
    return node.kind === "DefaultStmt";
}
