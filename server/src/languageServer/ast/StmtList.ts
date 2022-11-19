import {ASTNode} from "./ASTNode";
import {VarDeclStmt} from "./VarDeclStmt";
import {CallExpr} from "./CallExpr";
import {BinaryOperator} from "./BinaryOperator";

export interface StmtList extends ASTNode {
    kind: "CompoundStmt";
    inner: (VarDeclStmt | CallExpr | BinaryOperator | StmtList)[];
}

export function isStmtList(node: ASTNode): node is StmtList {
    return node.kind === "CompoundStmt" }
