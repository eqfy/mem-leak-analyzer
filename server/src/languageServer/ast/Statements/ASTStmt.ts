import { ASTNode, isASTNodeWithType } from '../ASTNode';
import { isASTExpr } from '../Expressions/ASTExpr';
import { isCaseStmt } from './CaseStmt';
import { isDefaultStmt } from './DefaultStmt';
import { isDoStmt } from './DoStmt';
import { isForStmt } from './ForStmt';
import { isIfStmt } from './IfStmt';
import { isReturnStmt } from './ReturnStmt';
import { isStmtList } from './StmtList';
import { isSwitchStmt } from './SwitchStmt';
import { isVarDeclStmt } from './VarDeclStmt';
import { isWhileStmt } from './WhileStmt';

// represent a statement
export interface ASTStmt extends ASTNode {
	category: "Statement"
}

export function isASTStmt(node: ASTNode): node is ASTStmt {
	return isCaseStmt(node) || isDefaultStmt(node) || isDoStmt(node) || isForStmt(node) || isIfStmt(node) || isReturnStmt(node)
	|| isStmtList(node) || isSwitchStmt(node) || isVarDeclStmt(node) || isWhileStmt(node) || (isASTNodeWithType(node) && isASTExpr(node));
}
