import { ASTNode } from "../ASTNode";
import { ASTExpr } from "./ASTExpr";

// represent a unary expression (sizeof and alignof)
export interface UnaryExpr extends ASTExpr {
    kind: "UnaryExprOrTypeTraitExpr";
    name: "sizeof" | "alignof";
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    argType: {
        qualType: string;
    }
    inner?: [ASTNode]; // potentially be like sizeof(var) - need to visit the inner
}

export function isUnaryExpr(node: ASTNode): node is UnaryExpr {
    return node.kind === "UnaryExprOrTypeTraitExpr"
}
