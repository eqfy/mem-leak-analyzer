import {ASTNodeWithType} from "./ASTNode";
import {ImplicitCastExpr} from "./ImplicitCastExpr";
import {UnaryExprOrTypeTraitExpr} from "./UnaryExprOrTypeTraitExpr";

export interface CallExpr extends ASTNodeWithType {
    kind: "CallExpr";
    valueCategory: string;
    inner: (ImplicitCastExpr | UnaryExprOrTypeTraitExpr)[];
}
