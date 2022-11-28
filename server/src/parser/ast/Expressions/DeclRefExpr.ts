import { ASTNode } from "../ASTNode";
import { ASTExpr } from "./ASTExpr";

// represent a reference to some declared variable / function
export interface DeclRefExpr extends ASTExpr {
    kind: "DeclRefExpr";
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    referencedDecl: ReferencedDecl
}

export function isDeclRefExpr(node: ASTNode): node is DeclRefExpr {
    return node.kind === "DeclRefExpr";
}

export interface ReferencedDecl {
    id: string;
    kind: string;
    name: string;
    type: {
        qualType: string;
    }
}
