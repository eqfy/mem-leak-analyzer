import {ASTNode, ASTNodeWithType} from "./ASTNode";

export interface CompoundAssignOperator extends ASTNodeWithType {
    kind: "CompoundAssignOperator";
    opcode: "-=" | "+=";
    "computeLHSType": {
        "qualType": string
    },
    "computeResultType": {
        "qualType": string
    }
    inner: ASTNode[];
}

export function isCompoundAssignOperator(node: ASTNode): node is CompoundAssignOperator {
    return node.kind === "CompoundAssignOperator";
}
