import {ASTNode, ASTNodeWithType} from "./ASTNode";
import {ImplicitCastExpr} from "./ImplicitCastExpr";
import {CastingExpression} from "./CastingExpression";
import {UnaryOperator} from "./UnaryOperator";
import {IntegerLiteral} from "./IntegerLiteral";
import {CharacterLiteral} from "./CharacterLiteral";

export interface VarDecl extends ASTNodeWithType {
    kind: "VarDecl";
    name: string;
    storageClass?: "static";
    inner?: ASTNode[];
    init?: string;
}

export function isVarDecl(node: ASTNode): node is VarDecl {
    return node.kind === "VarDecl";
}
