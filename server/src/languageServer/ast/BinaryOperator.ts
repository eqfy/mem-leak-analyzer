import {ASTNodeWithType} from "./ASTNode";
import {DeclRefExpr} from "./DeclRefExpr";
import {CStyleCastExpr} from "./CStyleCastExpr";
import {UnaryOperator} from "./UnaryOperator";
import {ParenExpr} from "./ParenExpr";
import {IntegerLiteral} from "./IntegerLiteral";
import {ImplicitCastExpr} from "./ImplicitCastExpr";
import {CallExpr} from "./CallExpr";

export interface BinaryOperator extends ASTNodeWithType {
    kind: "BinaryOperator";
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    opcode: "+" | "=" | "<" | ">" | "<=" | ">=" | "*" | "-" | "<<" | ">>" ;
    inner: (CallExpr | DeclRefExpr | CStyleCastExpr | UnaryOperator | BinaryOperator | ParenExpr | IntegerLiteral | ImplicitCastExpr)[];
}
