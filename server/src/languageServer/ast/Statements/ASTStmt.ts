import { ASTNode, isASTNodeWithType } from '../ASTNode';
import { isASTExpr } from '../Expressions/ASTExpr';
import { isBreakStmt } from './BreakStmt';
import { isCaseStmt } from './CaseStmt';
import { isDefaultStmt } from './DefaultStmt';
import { isDoStmt } from './DoStmt';
import { isForStmt } from './ForStmt';
import { isIfStmt } from './IfStmt';
import { isNullStmt } from './NullStmt';
import { isReturnStmt } from './ReturnStmt';
import { isStmtList } from './StmtList';
import { isSwitchStmt } from './SwitchStmt';
import { isDeclStmt } from './DeclStmt';
import { isWhileStmt } from './WhileStmt';

// represent a statement
export interface ASTStmt extends ASTNode {
	category: "Statement"
}

export function isASTStmt(node: ASTNode): node is ASTStmt {
	return isBreakStmt(node) || isCaseStmt(node) || isDefaultStmt(node)
	|| isDoStmt(node) || isForStmt(node) || isIfStmt(node)
	|| isNullStmt(node) || isReturnStmt(node) || isStmtList(node)
	|| isSwitchStmt(node) || isDeclStmt(node) || isWhileStmt(node)
	|| (isASTNodeWithType(node) && isASTExpr(node));
}
