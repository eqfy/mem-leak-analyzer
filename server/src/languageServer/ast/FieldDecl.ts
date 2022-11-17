import {ASTNode} from "./ASTNode";

export interface FieldDecl extends ASTNode {
    kind: "FieldDecl";
    name: string;
    tageUsed: "struct";
    inner: FieldDecl[];
}
