import {ASTNode, ASTNodeWithType} from "./ASTNode";

// references some sort of declaration like a variable etc
export interface DeclRefExpr extends ASTNodeWithType {
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
