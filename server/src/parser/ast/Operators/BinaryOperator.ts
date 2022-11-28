import { ASTNode } from "../ASTNode";
import { ASTOperator } from "./ASTOperator";

// represent a binary operator (including assignments like a = 1)
export interface BinaryOperator extends ASTOperator {
    kind: "BinaryOperator";
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    opcode: "=" | string; // we are not interested in how 2 operands are combined other than assignment
    inner: [ASTNode, ASTNode];
    // left and right operands
    // for example, 'b = 0;': opcode="=", inner[0]=the variable name (declrefexp), and inner[1]="(integerliteral)
}

export function isBinaryOperator(node: ASTNode): node is BinaryOperator {
    return node.kind === "BinaryOperator";
}
