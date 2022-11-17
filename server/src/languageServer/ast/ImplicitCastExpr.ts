import {ASTNodeWithType} from "./ASTNode";
import {DeclRefExpr} from "./DeclRefExpr";

export interface ImplicitCastExpr extends ASTNodeWithType {
    kind: "ImplicitCastExpr";

    castKind: string;
    inner: (DeclRefExpr | ImplicitCastExpr | IntegerLiteral)[];
}
