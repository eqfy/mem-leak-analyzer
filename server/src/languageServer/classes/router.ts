import {Visitor} from "./Visitor";
import {ASTNode} from "../ast/ASTNode";
import {FunctionDecl} from "../ast/Declarations/FunctionDecl";

export function visitASTNode <T,U>(node: ASTNode, visitor: Visitor<T, U>, t: T): U{
  switch (node.kind) {
    case "FunctionDecl":
      return visitor.visitFunctionDecl(node as FunctionDecl, t);
      default:
        return visitor.visitFunctionDecl(node as FunctionDecl, t);
  }
}
