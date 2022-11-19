import {ASTNode, ASTNodeWithType} from "./ASTNode";
import {VarDeclStmt} from "./VarDeclStmt";

export interface CharacterLiteral extends ASTNodeWithType {
    kind: "CharacterLiteral";
    value: number; //fuck sakes lol I think this is probably ascii code
}

export function isCharacterLiteral(node: ASTNode): node is CharacterLiteral {
    return node.kind === "CharacterLiteral";
}
