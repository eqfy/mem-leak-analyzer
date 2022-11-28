import { ASTNode } from "../ASTNode";
import { ASTDecl } from './ASTDecl';
import { StructFieldDecl } from "./StructFieldDecl";

// represent the declaration of a struct
export interface StructDecl extends ASTNode, ASTDecl {
    kind: "RecordDecl";
    name: string;
    inner: StructFieldDecl[];
}

export function isStructDecl(node: ASTNode): node is StructDecl {
    return node.kind === "RecordDecl"
}
