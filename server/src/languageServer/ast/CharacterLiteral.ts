import {ASTNode, ASTNodeWithType} from "./ASTNode";
import {DeclStmt} from "./DeclStmt";

export interface CharacterLiteral extends ASTNodeWithType {
    kind: "CharacterLiteral";
    value: number; //fuck sakes lol I think this is probably ascii code
}
