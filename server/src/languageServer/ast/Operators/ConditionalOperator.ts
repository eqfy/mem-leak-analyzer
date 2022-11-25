import { ASTNode } from "../ASTNode";
import { ASTOperator } from "./ASTOperator";

// represent a ternary (conditional) operator in C: cond ? expr1 : expr2 (evaluate cond if expr1 is true, otherwise evaluate expr2)
export interface ConditionalOperator extends ASTOperator {
    kind: "ConditionalOperator";
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    inner: [ASTNode, ASTNode, ASTNode]; // cond, expr1, expr2 in that order
}

export function isConditionalOperator(node: ASTNode): node is ConditionalOperator {
    return node.kind === "ConditionalOperator";
}
