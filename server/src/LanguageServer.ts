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
import ErrorProvider from './errors/ErrorProvider';

export default class LanguageServer {
  connection: Connection;
  documents: TextDocuments<TextDocument>;
  errorProvider: ErrorProvider;

  constructor() {
    this.connection = createConnection(ProposedFeatures.all);
    this.initLanguageServer();
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
      this.errorProvider.validateTextDocument(change.document);
    });
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
