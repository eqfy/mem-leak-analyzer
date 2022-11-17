import {ASTNode} from "./ASTNode";
import {FieldDecl} from "./FieldDecl";

export interface RecordDecl extends ASTNode {
    kind: "RecordDecl";
    name: string;
    tageUsed: "struct";
    inner: FieldDecl[];
}
