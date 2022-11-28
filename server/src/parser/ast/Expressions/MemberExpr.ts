import { ASTNode } from "../ASTNode";
import { ASTExpr } from "./ASTExpr";

// represent a struct member access expression
export interface MemberExpr extends ASTExpr {
    kind: "MemberExpr";
    isArrow: boolean; // whether this is for the form a.b or a->b
    castKind: string;
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    name: string;
    referencedMemberDecl: string; //id
    inner: [ASTNode]; // If it is a->b, inner refers to a
}

export function isMemberExpr(node: ASTNode): node is MemberExpr {
    return node.kind === "MemberExpr";
}
