import {ASTNodeWithType} from "./ASTNode";
import {ImplicitCastExpr} from "./ImplicitCastExpr";
import {CStyleCastExpr} from "./CStyleCastExpr";
import {UnaryOperator} from "./UnaryOperator";

export interface VarDecl extends ASTNodeWithType {
    kind: "VarDecl";
    name: string;
    storageClass?: "static";
    inner?: (ImplicitCastExpr | CStyleCastExpr | UnaryOperator)[];
    init?: string;
}
