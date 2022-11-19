import { ASTNode } from '../ASTNode';
import { ASTExpr } from '../Expressions/ASTExpr';
import { isBinaryOperator } from './BinaryOperator';
import { isCompoundAssignOperator } from './CompoundAssignOperator';
import { isConditionalOperator } from './ConditionalOperator';
import { isUnaryOperator } from './UnaryOperator';

// represent a operator (is an expression)
export interface ASTOperator extends ASTExpr {}

export function isASTOperator(node: ASTNode): node is ASTOperator {
    return isBinaryOperator(node) || isCompoundAssignOperator(node) || isConditionalOperator(node) || isUnaryOperator(node);
}
