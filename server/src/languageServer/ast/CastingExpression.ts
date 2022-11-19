import {ASTNode, ASTNodeWithType} from "./ASTNode";

export interface CastingExpression extends ASTNodeWithType {
    kind: "CstyleCastExpr";
    castKind: string;
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    inner: ASTNode[];
}

export function isCStyleCastExpr(node: ASTNode): node is CastingExpression {
    return node.kind === "CStyleCastExpr"
}
