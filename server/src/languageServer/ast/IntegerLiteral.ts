import {ASTNode, ASTNodeWithType} from "./ASTNode";
import {VarDeclStmt} from "./VarDeclStmt";

export interface IntegerLiteral extends ASTNodeWithType {
    kind: "IntegerLiteral";
    value: number;
}

export function isIntegerLiteral(node: ASTNode): node is IntegerLiteral {
    return node.kind === "IntegerLiteral";
}
