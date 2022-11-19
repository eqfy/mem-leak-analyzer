import { ASTNode, ASTNodeWithType } from "../ASTNode";

// represent an integer literal (for example, 1)
export interface IntegerLiteral extends ASTNodeWithType {
    kind: "IntegerLiteral";
    value: number;
}

export function isIntegerLiteral(node: ASTNode): node is IntegerLiteral {
    return node.kind === "IntegerLiteral";
}
