import {ASTNode, ASTNodeWithType} from "./ASTNode";
import {ImplicitCastExpr} from "./ImplicitCastExpr";
import {CStyleCastExpr} from "./CStyleCastExpr";
import {UnaryOperator} from "./UnaryOperator";
import {IntegerLiteral} from "./IntegerLiteral";
import {CharacterLiteral} from "./CharacterLiteral";

export interface VarDecl extends ASTNodeWithType {
    kind: "VarDecl";
    name: string;
    storageClass?: "static";
    inner?: (ASTNodeWithType)[];
    init?: string;
}

export function isVarDecl(node: ASTNode): node is VarDecl {
    return node.kind === "VarDecl";
}
