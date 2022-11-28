import { ASTNode, ASTNodeWithType } from "../ASTNode";
import { ASTDecl } from './ASTDecl';

// represent the declaration of a struct field
export interface StructFieldDecl extends ASTNodeWithType, ASTDecl {
    kind: "FieldDecl";
    name: string;
}

export function isFieldDecl(node: ASTNode): node is StructFieldDecl {
    return node.kind === "FieldDecl";
}
