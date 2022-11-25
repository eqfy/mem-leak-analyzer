import { ASTNode } from "../ASTNode";
import { ASTLiteral } from "./ASTLiteral";

// represent an integer literal (for example, 1)
export interface IntegerLiteral extends ASTLiteral {
    kind: "IntegerLiteral";
    value: number;
}

export function isIntegerLiteral(node: ASTNode): node is IntegerLiteral {
    return node.kind === "IntegerLiteral";
}
