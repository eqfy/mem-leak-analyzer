import {ASTNode, ASTNodeWithType} from "./ASTNode";
import {DeclStmt} from "./DeclStmt";

export interface IntegerLiteral extends ASTNodeWithType {
    kind: "IntegerLiteral";
    value: number;
}
