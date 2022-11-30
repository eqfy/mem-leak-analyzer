import { Diagnostic, Message } from 'vscode-languageserver';
import { ASTRange } from '../parser/ast/ASTNode';
import { TextDocument } from 'vscode-languageserver-textdocument';

export default class ErrorCollector {
  errors: MemoryError[] = [];
  errorSet: Set<string> = new Set();
  textDocument: TextDocument;

  constructor(textDocument: TextDocument) {
    this.textDocument = textDocument;
  }

  addMemoryError(range: ASTRange, message: string, severity: ErrSeverity): void {
    const errorCode = JSON.stringify(range) + message + severity;
    if (this.errorSet.has(errorCode)) return;
    this.errorSet.add(errorCode);
    this.errors.push(this.createMemErr(range, message, severity));
  }

  createMemErr(range: ASTRange, message: string, severity: ErrSeverity): MemoryError {
    const diagRange = {
      start: this.textDocument.positionAt(range.begin.offset),
      end: this.textDocument.positionAt(range.end.offset + 1)
    };
    return Diagnostic.create(diagRange, message, severity);
  }
}

export enum ErrSeverity {
  /**
   * Reports an error.
   */
  Error = 1, // red
  /**
   * Reports a warning.
   */
  Warning = 2, // orange
  /**
   * Reports an information.
   */
  Information = 3,
  /**
   * Reports a hint.
   */
  Hint = 4
}

export type MemoryError = Diagnostic;
