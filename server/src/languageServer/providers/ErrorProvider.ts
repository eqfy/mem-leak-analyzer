import { Connection } from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

export default class ErrorProvider {
  connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async validateTextDocument(textDocument: TextDocument) {

  }
}
