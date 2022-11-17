import {ASTNodeWithType} from "./ASTNode";

export interface UnaryExprOrTypeTraitExpr extends ASTNodeWithType {
    kind: "UnaryExprOrTypeTraitExpr";
    name: string;
    argType: {
        qualType: string;
    }
}
