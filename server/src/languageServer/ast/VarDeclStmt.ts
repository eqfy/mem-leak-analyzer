import {ASTNode, ASTNodeWithType} from "./ASTNode";
import {VarDecl} from "./VarDecl";

export interface VarDeclStmt extends ASTNodeWithType {
    kind: "DeclStmt";
    inner: (VarDecl)[]; // len  = 1
}

export function isVarDeclStmt(node: ASTNode): node is VarDeclStmt {
    return node.kind === "DeclStmt";
}
