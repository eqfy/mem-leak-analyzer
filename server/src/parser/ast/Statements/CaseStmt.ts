import { ASTNode } from "../ASTNode";
import { ConstantExpr } from '../Expressions/ConstantExpr';
import { ASTStmt } from "./ASTStmt";

// represent a case statement inside a switch
export interface CaseStmt extends ASTStmt {
    kind: "CaseStmt";
    inner: [ConstantExpr, ASTNode]; // the constant expr used in case matching and whatever followed
}

export function isCaseStmt(node: ASTNode): node is CaseStmt {
    return node.kind === "CaseStmt";
}
