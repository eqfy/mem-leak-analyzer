import {ASTNode, ASTNodeWithType} from "./ASTNode";

export interface StructFieldDecl extends ASTNodeWithType {
    kind: "FieldDecl";
    name: string;
}

export function isFieldDecl(node: ASTNode): node is StructFieldDecl {
    return node.kind === "FieldDecl";
}
