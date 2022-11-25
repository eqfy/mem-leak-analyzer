import { ASTNode, ASTNodeWithType } from "../ASTNode";
import { ASTDecl } from '../Declarations/ASTDecl';
import { ASTStmt } from "./ASTStmt";

// represent a declaration statement
export interface VarDeclStmt extends ASTStmt {
    kind: "DeclStmt";
    inner: [ASTDecl]; // the declaration
}

export function isVarDeclStmt(node: ASTNode): node is VarDeclStmt {
    return node.kind === "DeclStmt";
}
