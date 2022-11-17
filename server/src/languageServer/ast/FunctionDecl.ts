import {ASTNode, ASTNodeWithType} from "./ASTNode";
import {CompoundStmt} from "./CompoundStmt";

export interface FunctionDecl extends ASTNodeWithType {
    kind: "FunctionDecl";
    name: string;
    inner: (ParmVarDecl | CompoundStmt)[];
}
