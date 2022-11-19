import {ASTNode, ASTNodeWithType} from "./ASTNode";
import {ParenExpr} from "./ParenExpr";
import {ImplicitCastExpr} from "./ImplicitCastExpr";

export interface UnaryOperator extends ASTNodeWithType {
    kind: "UnaryOperator";
    opcode: string;
    isPostfix: boolean;
    canOverflow: boolean;
    inner: (ParenExpr | ImplicitCastExpr)[];
}

export function isUnaryOperator(node: ASTNode): node is UnaryOperator {

    return node.kind === "UnaryOperator";
}
