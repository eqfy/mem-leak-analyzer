import {ASTNodeWithType} from "./ASTNode";
import {DeclRefExpr} from "./DeclRefExpr";
import {CStyleCastExpr} from "./CStyleCastExpr";

export interface BinaryOperator extends ASTNodeWithType {
    kind: "BinaryOperator";
    
    opcode: string;
    inner: (DeclRefExpr | CStyleCastExpr)[];
}
