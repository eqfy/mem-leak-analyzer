import {ASTNode, ASTNodeWithType} from "./ASTNode";
import {DeclRefExpr} from "./DeclRefExpr";

export interface MemberExpr extends ASTNodeWithType {
    kind: "MemberExpr";
    isArrow: boolean;
    castKind: string;
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    name: string;
    referencedMemberDecl: string; //id
    inner: DeclRefExpr[];
}

export function isMemberExpr(node: ASTNode): node is MemberExpr {
    return node.kind === "MemberExpr";
}
