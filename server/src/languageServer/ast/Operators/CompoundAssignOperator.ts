import { ASTNode, ASTNodeWithType } from "../ASTNode";

// represent the -= and += operator for self-decrement and self-increment
export interface CompoundAssignOperator extends ASTNodeWithType {
    kind: "CompoundAssignOperator";
    opcode: "-=" | "+=";
    "computeLHSType": {
        "qualType": string
    },
    "computeResultType": {
        "qualType": string
    }
    inner: [ASTNode, ASTNode]; // left and right hand side of the compound assignment
}

export function isCompoundAssignOperator(node: ASTNode): node is CompoundAssignOperator {
    return node.kind === "CompoundAssignOperator";
}
