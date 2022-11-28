import { ASTNode, ASTNodeWithType } from '../ASTNode';
import { isBinaryOperator } from './BinaryOperator';
import { isCompoundAssignOperator } from './CompoundAssignOperator';
import { isConditionalOperator } from './ConditionalOperator';
import { isUnaryOperator } from './UnaryOperator';

// represent a operator (is an expression)
export interface ASTOperator extends ASTNodeWithType {
    category: "Operator";
}

export function isASTOperator(node: ASTNode): node is ASTOperator {
    return isBinaryOperator(node) || isCompoundAssignOperator(node) || isConditionalOperator(node)
    || isUnaryOperator(node);
}
