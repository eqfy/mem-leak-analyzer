import {ASTNodeWithType} from "./ASTNode";
import {VarDecl} from "./VarDecl";

export interface DeclStmt extends ASTNodeWithType {
    kind: "DeclStmt";
    inner: (VarDecl)[];
}
