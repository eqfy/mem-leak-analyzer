
import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  TextDocumentSyncKind,
  InitializeResult,
  Connection
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import ErrorProvider from './providers/ErrorProvider';
import { VisualizerApp } from '../app/rest/VisualizerApp';
import * as fs from 'fs';
import path from 'path';

export default class LanguageServer {
  connection: Connection;
  documents: TextDocuments<TextDocument>;
  errorProvider: ErrorProvider;

  constructor() {
    this.connection = createConnection(ProposedFeatures.all);
    this.initLanguageServer();
    this.initVisualizerServer();
    this.errorProvider = new ErrorProvider(this.connection);
    this.documents = new TextDocuments(TextDocument);
    this.setupHandlers();
    this.documents.listen(this.connection);
    this.connection.listen();
  }

  private setupHandlers() {
    this.setupOnDidChangeContentHandler();
  }

  private setupOnDidChangeContentHandler() {
    this.documents.onDidChangeContent((change) => {
      console.debug('onDidChangeContent');
      fs.writeFile(path.join(__dirname, '../test.c'), change.document.getText(), function (err) {
        if (err) {
          return console.error(err);
        }
      });
      this.errorProvider.validateTextDocument(change.document);
    });
  }

  private initVisualizerServer() {
    console.info('App - starting');
    const app = new VisualizerApp();
    (async () => {
      await app.initServer(1337);
    })();
  }

  private initLanguageServer() {
    this.connection.onInitialize((params: InitializeParams) => {
      const result: InitializeResult = {
        capabilities: {
          textDocumentSync: TextDocumentSyncKind.Incremental,
          workspace: {
            workspaceFolders: {
              supported: true
            }
          }
        }
      };
      return result;
    });
  }
}
