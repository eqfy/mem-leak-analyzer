import { ASTNodeWithType} from "./ASTNode";
import {DeclRefExpr} from "./DeclRefExpr";
import {DeclStmt} from "./DeclStmt";
import {CompoundStmt} from "./CompoundStmt";

export interface ParmVarDecl extends ASTNodeWithType {
    kind: "ParmVarDecl";
    name: string;
}
