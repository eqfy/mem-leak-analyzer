import { ASTNodeWithType} from "./ASTNode";
import {DeclRefExpr} from "./DeclRefExpr";

export interface MemberExpr extends ASTNodeWithType {
    kind: "MemberExpr";
    isArrow: boolean;
    castKind: string;
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    name: string;
    referencedMemberDecl: string; //id
    inner: (DeclRefExpr)[];
}
