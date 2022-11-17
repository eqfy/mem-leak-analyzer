import {ASTNodeWithType} from "./ASTNode";

export interface DeclRefExpr extends ASTNodeWithType {
    kind: "DeclRefExpr";
    referencedDecl: ReferencedDecl
}

export interface ReferencedDecl {
    id: string;
    kind: string;
    name: string;
    type: {
        qualType: string;
    }
}
