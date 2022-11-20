import { TextDocument } from 'vscode-languageserver-textdocument';
import { testing } from '../../constants';
import ErrBuilder, { ErrSeverity, MemoryError } from './ErrBuilder';
import { AST } from '../ast/AST';
import { ClogVisitor } from './ClogVisitor';

export default class Analyzer {
  public getAllErrors(cProgramAST: AST, textDocument: TextDocument): MemoryError[] {
    const errors: MemoryError[] = [];
    const clogVisitor = new ClogVisitor();
    clogVisitor.visit(cProgramAST, this.getVoid(), clogVisitor);

    // visitor will be called here or whatever is needed to produce the errors
    // const analyzerVistitor = new AnalyzerVisitor();
    // analyzerVistitor.visit(cProgramAST, this.getVoid(), analyzerVistitor);

    return testing ? errors : this.getTestData(textDocument);
  }

  public getTestData(textDocument: TextDocument): MemoryError[] {
    const errors: MemoryError[] = [];
    const err = ErrBuilder.createMemErr(
      {
        begin: {
          offset: 0
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
    return errors;
  }

  public getVoid() {
    return;
  }
}
