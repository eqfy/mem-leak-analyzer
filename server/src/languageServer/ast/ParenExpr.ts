import {ASTNode, ASTNodeWithType} from "./ASTNode";

export interface ParenExpr extends ASTNodeWithType {
    kind: "ParenExpr";
    inner: (ASTNode)[];
}

export function isParenExpr(node: ASTNode): node is ParenExpr {
    return node.kind === "ParenExpr";
}
