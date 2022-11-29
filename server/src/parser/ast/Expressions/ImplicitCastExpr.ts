import { ASTNode, ASTNodeWithType } from "../ASTNode";
import { ASTExpr } from "./ASTExpr";

// represent an implicit type casting expression
export interface ImplicitCastExpr extends ASTExpr {
    kind: "ImplicitCastExpr";
    castKind: 'FunctionToPointerDecay' | string; // either function pointer, or kinds we don't care about
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    inner: [ASTNodeWithType]; // the ASTNode to apply type casting on
}

export function isImplicitCastExpr(node: ASTNode): node is ImplicitCastExpr {
    return node.kind === "ImplicitCastExpr";
}
