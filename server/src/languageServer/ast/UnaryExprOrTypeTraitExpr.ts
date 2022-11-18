import {ASTNodeWithType} from "./ASTNode";

export interface UnaryExprOrTypeTraitExpr extends ASTNodeWithType {
    kind: "UnaryExprOrTypeTraitExpr";
    name: string;
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    argType: {
        qualType: string;
    }
}
