import { ASTNode, ASTNodeWithType } from "../ASTNode";
import {ASTLiteral} from "./ASTLiteral";

// represent a character literal (for example, 'a')
export interface CharacterLiteral extends ASTLiteral {
    kind: "CharacterLiteral";
    value: number; //fuck sakes lol I think this is probably ascii code
}

export function isCharacterLiteral(node: ASTNode): node is CharacterLiteral {
    return node.kind === "CharacterLiteral";
}
