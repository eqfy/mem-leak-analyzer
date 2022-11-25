import { ASTNodeWithType } from '../ASTNode';
import { isCallExpr } from './CallExpr';
import { isConstantExpr } from './ConstantExpr';
import { isDeclRefExpr } from './DeclRefExpr';
import { isExplicitCastExpr } from './ExplicitCastExpr';
import { isImplicitCastExpr } from './ImplicitCastExpr';
import { isMemberExpr } from './MemberExpr';
import { isASTOperator } from '../Operators/ASTOperator';
import { isParenExpr } from './ParenExpr';
import { isUnaryExpr } from './UnaryExpr';
import { isASTLiteral } from '../Literals/ASTLiteral';

// represent an expression (is a statement)
export interface ASTExpr extends ASTNodeWithType {
    category: "Expression";
}

export function isASTExpr(node: ASTNodeWithType): node is ASTExpr {
    return isCallExpr(node) || isCallExpr(node) || isConstantExpr(node)
    || isDeclRefExpr(node) || isExplicitCastExpr(node) || isImplicitCastExpr(node)
    || isMemberExpr(node) || isParenExpr(node) || isUnaryExpr(node)
    || isASTOperator(node) || isASTLiteral(node);
}
