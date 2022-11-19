import {ASTNode} from "./ASTNode";

export interface CaseConstant extends ASTNode {
    kind: "ConstantExpr";
    inner: ASTNode[]; // [0] is the number

}

export function isCaseConstant(node: ASTNode): node is CaseConstant {
    return node.kind === "ConstantExpr";

}
