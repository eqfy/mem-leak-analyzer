import {ASTNode, ASTNodeWithType} from "./ASTNode";

export interface FunctionParameterName extends ASTNodeWithType {
    kind: "ParmVarDecl";
    name: string;
}

export function isFunctionParameterName(node: ASTNode): node is FunctionParameterName {
    return node.kind === "ParmVarDecl";
}
