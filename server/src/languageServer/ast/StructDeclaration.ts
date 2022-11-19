import {ASTNode} from "./ASTNode";
import {StructFieldDecl} from "./StructFieldDecl";

export interface StructDeclaration extends ASTNode {
    kind: "RecordDecl";
    name: string;
    tageUsed: "struct";
    inner: StructFieldDecl[];
}

export function isStructDeclaration(node: ASTNode): node is StructDeclaration {
    return node.kind === "RecordDecl"
}
