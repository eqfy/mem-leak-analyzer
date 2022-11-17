import {ASTNode} from "./ASTNode";
import {DeclStmt} from "./DeclStmt";
import {CallExpr} from "./CallExpr";
import {BinaryOperator} from "./BinaryOperator";

export interface CompoundStmt extends ASTNode {
    kind: "CompoundStmt";
    inner: (DeclStmt | CallExpr | BinaryOperator)[];
}
