import {ASTNode, ASTNodeWithType} from "./ASTNode";
import {DeclRefExpr} from "./DeclRefExpr";
import {VarDeclStmt} from "./VarDeclStmt";
import {StmtList} from "./StmtList";

export interface FunctionParameterName extends ASTNodeWithType {
    kind: "ParmVarDecl";
    name: string;
}

export function isFunctionParameterName(node: ASTNode): node is FunctionParameterName {
    return node.kind === "ParmVarDecl";
}
