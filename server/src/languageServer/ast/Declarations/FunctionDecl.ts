import { ASTNode, ASTNodeWithType } from "./../ASTNode";
import { StmtList } from "../Statements/StmtList";
import { FunctionParamDecl } from "./FunctionParamDecl";
import { ASTDecl } from './ASTDecl';

// represent the declaration of a function
export interface FunctionDecl extends ASTNodeWithType, ASTDecl {
    kind: "FunctionDecl";
    name: string;
    // always has a list of parameters before the function body
    // if function has an empty body (i.e. "{}"), it will not have the StmtList
    inner: (FunctionParamDecl | StmtList)[];
}

export function isFunctionDecl(node: ASTNode): node is FunctionDecl {
    return node.kind === "FunctionDecl";
}
