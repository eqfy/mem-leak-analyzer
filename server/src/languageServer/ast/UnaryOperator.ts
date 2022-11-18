import {ASTNodeWithType} from "./ASTNode";
import {ParenExpr} from "./ParenExpr";
import {ImplicitCastExpr} from "./ImplicitCastExpr";

export interface UnaryOperator extends ASTNodeWithType {
    kind: "UnaryOperator";
    opcode: string;
    isPostfix: boolean;
    canOverflow: boolean;
    inner: (ParenExpr | ImplicitCastExpr)[];
}
