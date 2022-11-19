import { ASTNode, ASTNodeWithType } from "../ASTNode";

// represent a unary operator
export interface UnaryOperator extends ASTNodeWithType {
    kind: "UnaryOperator";
    opcode: "++" | "--" | "&" | '*'; // self-increment and self-decrement, reference and dereference
    isPostfix: boolean; // whether the operator is after the operand (tied to ++ and --, should be irrevelant as we are not evaluating values)
    canOverflow: boolean;
    inner: [ASTNode]; // the single operand
}

export function isUnaryOperator(node: ASTNode): node is UnaryOperator {
    return node.kind === "UnaryOperator";
}
