import { ASTNode, ASTNodeWithType } from "../ASTNode";
import { ASTDecl } from './ASTDecl';

// represent the declaration of a variable
export interface VarDecl extends ASTNodeWithType, ASTDecl {
    kind: "VarDecl";
    name: string;
    // storageClass?: "static"; // currently irrevelant to our one-file analysis; uncommented if scope needs to be changed
    inner?: [ASTNodeWithType]; // will have exactly 1 typed child if initialized, or no inner at all if just declared
}

export function isVarDecl(node: ASTNode): node is VarDecl {
    return node.kind === "VarDecl";
}
