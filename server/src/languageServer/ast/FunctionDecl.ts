import {ASTNode, ASTNodeWithType} from "./ASTNode";
import {StmtList} from "./StmtList";
import {FunctionParameterName} from "./FunctionParameterName";

export interface FunctionDecl extends ASTNodeWithType {
    kind: "FunctionDecl";
    name: string;
    inner: (FunctionParameterName | StmtList)[];
}

export function isFunctionDecl(node: ASTNode): node is FunctionDecl {
    return node.kind === "FunctionDecl";
}
