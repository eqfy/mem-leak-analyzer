import {ASTNode, ASTNodeWithType} from "./ASTNode";

export interface ConditionalOperator extends ASTNodeWithType {
    kind: "ConditionalOperator";
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    inner: ASTNode[]; // len = 3,
    //example:  k ? do x : do y
    // k would be at index 0, do x would be at index 1, do y would be at index 2
}

export function isConditionalOperator(node: ASTNode): node is ConditionalOperator {
    return node.kind === "ConditionalOperator";
}
