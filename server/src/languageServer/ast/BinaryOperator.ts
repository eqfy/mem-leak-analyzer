import {ASTNode, ASTNodeWithType} from "./ASTNode";
import {DeclRefExpr} from "./DeclRefExpr";
import {CStyleCastExpr} from "./CStyleCastExpr";
import {UnaryOperator} from "./UnaryOperator";
import {ParenExpr} from "./ParenExpr";
import {IntegerLiteral} from "./IntegerLiteral";
import {ImplicitCastExpr} from "./ImplicitCastExpr";
import {CallExpr} from "./CallExpr";

// could be a variable assignment too
// literally anything that has two operaands
export interface BinaryOperator extends ASTNodeWithType {
    kind: "BinaryOperator";
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    opcode: "+" | "=" | "<" | ">" | "<=" | ">=" | "*" | "-" | "<<" | ">>" ;
    inner: (ASTNodeWithType)[]; // len = 2
}

export function isBinaryOperator(node: ASTNode): node is BinaryOperator {
    return node.kind === "BinaryOperator";
}
