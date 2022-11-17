import {ASTNodeWithType} from "./ASTNode";
import {ParenExpr} from "./ParenExpr";

export interface UnaryOperator extends ASTNodeWithType {
    kind: "UnaryOperator";
    opcode: string;
    isPostfix: boolean;
    canOverflow: boolean;
    inner: (ParenExpr)[];
}
