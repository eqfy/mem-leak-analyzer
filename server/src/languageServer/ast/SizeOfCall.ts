import {ASTNode, ASTNodeWithType} from "./ASTNode";

export interface SizeOfCall extends ASTNodeWithType {
    kind: "UnaryExprOrTypeTraitExpr";
    name: "sizeof";
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    argType: {
        qualType: string;
    }
}

export function isSizeOfCall(node: ASTNode): node is SizeOfCall {
    return node.kind === "UnaryExprOrTypeTraitExpr"
}
