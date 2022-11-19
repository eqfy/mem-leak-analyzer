import {ASTNode, ASTNodeWithType} from "./ASTNode";
import {DeclRefExpr} from "./DeclRefExpr";
import {CastingExpression} from "./CastingExpression";
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
    inner: (ASTNode)[]; // len = 2 in order of left to right.
                                    // for example,if it was 'b = 0;':    opcode="=", inner[0]=the variable name (declrefexp), and inner[1]="(integerliteral)
}

export function isBinaryOperator(node: ASTNode): node is BinaryOperator {
    return node.kind === "BinaryOperator";
}
