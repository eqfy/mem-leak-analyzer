import { Connection } from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import Analyzer from '../classes/Analyzer';
import CParser from '../classes/CParser';
import { Diagnostic } from 'vscode-languageserver';

export default class ErrorProvider {
  connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public validateTextDocument(textDocument: TextDocument) {
    const ast = CParser.getAST(textDocument.getText());
    const analyzer = new Analyzer();
    console.log('test');
    console.log(JSON.stringify(ast, null, 2));
    const diagnostics: Diagnostic[] = analyzer.getAllErrors(ast, textDocument);
    this.connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
  }
}
