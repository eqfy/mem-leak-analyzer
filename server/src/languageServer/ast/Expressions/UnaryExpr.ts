import { ASTNode, ASTNodeWithType } from "../ASTNode";
import {ASTExpr} from "./ASTExpr";

// represent a unary expression (sizeof and alignof)
export interface UnaryExpr extends ASTExpr {
    kind: "UnaryExprOrTypeTraitExpr";
    name: "sizeof" | "alignof";
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    argType: {
        qualType: string;
    }
}

export function isUnaryExpr(node: ASTNode): node is UnaryExpr {
    return node.kind === "UnaryExprOrTypeTraitExpr"
}
