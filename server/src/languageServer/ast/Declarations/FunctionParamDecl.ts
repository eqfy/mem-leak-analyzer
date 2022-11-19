import { ASTNode, ASTNodeWithType } from "../ASTNode";
import { ASTDecl } from './ASTDecl';

// represent the declaration of a function parameter
export interface FunctionParamDecl extends ASTNodeWithType, ASTDecl {
    kind: "ParmVarDecl";
    name: string;
}

export function isFunctionParamDecl(node: ASTNode): node is FunctionParamDecl {
    return node.kind === "ParmVarDecl";
}
