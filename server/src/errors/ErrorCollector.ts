import { Diagnostic } from 'vscode-languageserver';
import { ASTRange } from '../parser/ast/ASTNode';
import { TextDocument } from 'vscode-languageserver-textdocument';

export default class ErrorCollector {
  errors: MemoryError[] = [];

  addMemoryError (range: ASTRange, message: string, severity: ErrSeverity, textDocument: TextDocument): void {
    this.errors.push(ErrorCollector.createMemErr(range, message, severity, textDocument));
  }

  static createMemErr(range: ASTRange, message: string, severity: ErrSeverity, textDocument: TextDocument): MemoryError {
    const diagRange = {
      start: textDocument.positionAt(range.begin.offset),
      end: textDocument.positionAt(range.end.offset + 1)
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