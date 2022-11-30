import { TextDocument } from 'vscode-languageserver-textdocument';
import { ErrSeverity, MemoryError } from '../errors/ErrorCollector';
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
    const ctx: AnalyzerVisitorContext = createNewProgramState(textDocument);
    analyzerVisitor.visit(cProgramAST, ctx, analyzerVisitor);

    return testing ? this.getTestData(ctx) : ctx.errorCollector.errors;
  }

  public getTestData(ctx: AnalyzerVisitorContext): MemoryError[] {
    const errors: MemoryError[] = [];
    const err = ctx.errorCollector.createMemErr(
      {
        begin: {
          offset: 3
        },
        end: {
          offset: 27
        }
      },
      'testing 123',
      ErrSeverity.Error
    );
    errors.push(err);
    const err2 = ctx.errorCollector.createMemErr(
      {
        begin: {
          offset: 27
        },
        end: {
          offset: 50
        }
      },
      'testing 123 warning',
      ErrSeverity.Warning
    );
    errors.push(err2);
    return errors;
  }

  public getVoid() {
    return;
  }
}
