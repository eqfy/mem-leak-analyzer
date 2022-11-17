import {ASTNode, ASTNodeWithType} from "./ASTNode";

export interface ParenExpr extends ASTNodeWithType {
    kind: "ParenExpr";
    inner: (ASTNode)[];
}
