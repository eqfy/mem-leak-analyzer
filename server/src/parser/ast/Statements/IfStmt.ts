import {ASTNode} from "../ASTNode";
import {StmtList} from "./StmtList";
import {ASTStmt} from "./ASTStmt";

// represent an if statement
/*
    the AST generation treats else if in the following equivalent conversion (nesting ifs):

    if (1) {
        a;
    } else if (2) {
        b;
    } else {
        c;
    }

    to:

    if (1) {
        a;
    } else {
        if (2) {
            b;
        } else {
            c;
        }
    }
*/

export interface IfStmt extends ASTStmt {
    kind: "IfStmt";
    inner: [ASTNode, StmtList, (StmtList | IfStmt)?]; // the condition, body, (optional) else body when it is "else", or a nested if when it is "else if"
    hasElse: boolean; // whether it has an else/else if (equivalent to whether inner[2] does exist)
}

export function isIfStmt(node: ASTNode): node is IfStmt {
    return node.kind === "IfStmt";
}

