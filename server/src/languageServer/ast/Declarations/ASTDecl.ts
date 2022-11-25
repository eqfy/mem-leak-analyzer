import { ASTNode } from '../ASTNode';
import { isFunctionDecl } from './FunctionDecl';
import { isFunctionParamDecl } from './FunctionParamDecl';
import { isStructDecl } from './StructDecl';
import { isVarDecl } from './VarDecl';

// represent a declaration
export interface ASTDecl extends ASTNode {
    category: "Declaration";
}

export function isASTDecl(node: ASTNode): node is ASTDecl {
    return isFunctionDecl(node) || isFunctionParamDecl(node) || isStructDecl(node)
    || isStructDecl(node) || isVarDecl(node);
}
