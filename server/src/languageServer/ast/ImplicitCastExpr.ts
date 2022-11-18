import {ASTNodeWithType} from "./ASTNode";
import {DeclRefExpr} from "./DeclRefExpr";
import {IntegerLiteral} from "./IntegerLiteral";
import {UnaryOperator} from "./UnaryOperator";
import {BinaryOperator} from "./BinaryOperator";

export interface ImplicitCastExpr extends ASTNodeWithType {
    kind: "ImplicitCastExpr";
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    castKind: string;
    inner: (DeclRefExpr | ImplicitCastExpr | IntegerLiteral | UnaryOperator | BinaryOperator)[];
}
