import { ASTNode, ASTNodeWithType } from "../ASTNode";
import {ASTExpr} from "./ASTExpr";

// represent an implicit type casting expression
export interface ImplicitCastExpr extends ASTExpr {
    kind: "ImplicitCastExpr";
    castKind: string;
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    inner: [ASTNode]; // the ASTNode to apply type casting on
}

export function isImplicitCastExpr(node: ASTNode): node is ImplicitCastExpr {
    return node.kind === "ImplicitCastExpr";
}
