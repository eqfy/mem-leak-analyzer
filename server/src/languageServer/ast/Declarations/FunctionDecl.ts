import { ASTNode, ASTNodeWithType } from "../ASTNode";
import { StmtList } from "../Statements/StmtList";
import { FunctionParamDecl } from "./FunctionParamDecl";
import { ASTDecl } from './ASTDecl';

// represent the declaration of a function
export interface FunctionDecl extends ASTNodeWithType, ASTDecl {
    kind: "FunctionDecl";
    name: string;
    // always has a list of parameters before the function body
    // if function has an empty body (i.e. "{}"), it will not have the StmtList
    inner?: FunctionParamDecl[] | [...FunctionParamDecl[], StmtList];
    // if inner doesnt exist, then its just a declaration without params
    // if inner is just params, then its a declaration with params
    // if there is both params, and a stmt list, then it is a declaration with params and a body
    // if is it just a stmt list, then it is a declaration with no params, but has a body
}

export function isFunctionDecl(node: ASTNode): node is FunctionDecl {
    return node.kind === "FunctionDecl";
}
