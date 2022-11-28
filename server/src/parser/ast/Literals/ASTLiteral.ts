import { ASTNodeWithType } from '../ASTNode';
import { isCharacterLiteral } from './CharacterLiteral';
import { isIntegerLiteral } from './IntegerLiteral';

// represent a literal (is an expression)
export interface ASTLiteral extends ASTNodeWithType {
    category: "Literal";
}

export function isASTLiteral(node: ASTNodeWithType): node is ASTLiteral {
    return isCharacterLiteral(node) || isIntegerLiteral(node);
}
