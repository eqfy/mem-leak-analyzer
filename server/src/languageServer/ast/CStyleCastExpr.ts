import { ASTNodeWithType} from "./ASTNode";
import {CallExpr} from "./CallExpr";

export interface CStyleCastExpr extends ASTNodeWithType {
    kind: "CstyleCastExpr";
    castKind: string;
    valueCategory: "prvalue" | "xvalue" | "lvalue";
    inner: (CallExpr)[];
}
