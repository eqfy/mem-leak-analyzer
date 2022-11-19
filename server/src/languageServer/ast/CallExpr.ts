import {ASTNode, ASTNodeWithType} from "./ASTNode";
import {ImplicitCastExpr} from "./ImplicitCastExpr";
import {SizeOfCall} from "./SizeOfCall";

export interface CallExpr extends ASTNodeWithType {
    kind: "CallExpr";
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    inner: (ASTNodeWithType)[];
}

export function isCallExpr(node: ASTNode): node is CallExpr {
    return node.kind === "CallExpr"
}
