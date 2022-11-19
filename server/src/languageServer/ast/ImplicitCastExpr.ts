import {ASTNode, ASTNodeWithType} from "./ASTNode";
import {DeclRefExpr} from "./DeclRefExpr";
import {IntegerLiteral} from "./IntegerLiteral";
import {UnaryOperator} from "./UnaryOperator";
import {BinaryOperator} from "./BinaryOperator";
import {CharacterLiteral} from "./CharacterLiteral";

export interface ImplicitCastExpr extends ASTNodeWithType {
    kind: "ImplicitCastExpr";
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    castKind: string;
    inner: ASTNode[];
}

export function isImplicitCastExpr(node: ASTNode): node is ImplicitCastExpr {
    return node.kind === "ImplicitCastExpr";
}
