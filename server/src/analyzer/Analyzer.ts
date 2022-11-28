import { TextDocument } from 'vscode-languageserver-textdocument';
import ErrorCollector, { ErrSeverity, MemoryError } from '../errors/ErrorCollector';
import { AST } from '../parser/ast/AST';
import { ClogVisitor } from '../visitor/ClogVisitor';
import { AnalyzerVisitor, AnalyzerVisitorContext } from './AnalyzerVisitor';
import { createNewProgramState } from './ProgramState';
import { testing } from '../constants';

export default class Analyzer {
  public getAllErrors(cProgramAST: AST, textDocument: TextDocument): MemoryError[] {
    const errors: MemoryError[] = [];
    const clogVisitor = new ClogVisitor();
    if (testing) clogVisitor.visit(cProgramAST, this.getVoid(), clogVisitor);

    const analyzerVisitor = new AnalyzerVisitor();
    const ctx: AnalyzerVisitorContext = createNewProgramState();
    analyzerVisitor.visit(cProgramAST, ctx, analyzerVisitor);

    return testing ? this.getTestData(textDocument) : errors;
  }

  public getTestData(textDocument: TextDocument): MemoryError[] {
    const errors: MemoryError[] = [];
    const err = ErrorCollector.createMemErr(
      {
        begin: {
          offset: 3
        },
        end: {
          offset: 27
        }
      },
      'testing 123',
      ErrSeverity.Error,
      textDocument
    );
    errors.push(err);
    const err2 = ErrorCollector.createMemErr(
      {
        begin: {
          offset: 27
        },
        end: {
          offset: 50
        }
      },
      'testing 123 warning',
      ErrSeverity.Warning,
      textDocument
    );
    errors.push(err2);
    return errors;
  }

  public getVoid() {
    return;
  }
}