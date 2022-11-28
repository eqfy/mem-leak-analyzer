import { Connection } from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import Analyzer from '../analyzer/Analyzer';
import CParser from '../parser/CParser';
import { Diagnostic } from 'vscode-languageserver';
import {AST} from "../parser/ast/AST";

export default class ErrorProvider {
  connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public validateTextDocument(textDocument: TextDocument) {
    const ast: AST = CParser.getAST(textDocument.getText());
    const analyzer = new Analyzer();
    const diagnostics: Diagnostic[] = analyzer.getAllErrors(ast, textDocument);
    this.connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
  }
}
