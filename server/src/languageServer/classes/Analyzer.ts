import { TextDocument } from 'vscode-languageserver-textdocument'
import ErrBuilder, { ErrSeverity, MemoryError } from './ErrBuilder';
import { AST } from '../ast/AST';
import { ClogVisitor } from './ClogVisitor';
import { AnalyzerVisitor, AnalyzerVisitorContext } from './AnalyzerVisitor';
import { MemoryBlock, MemoryPointer } from './ProgramState';
import {testing} from "../constants";

export default class Analyzer {
  public getAllErrors(cProgramAST: AST, textDocument: TextDocument): MemoryError[] {
    const errors: MemoryError[] = [];
    const clogVisitor = new ClogVisitor();
    if (testing) clogVisitor.visit(cProgramAST, this.getVoid(), clogVisitor);

    const analyzerVistitor = new AnalyzerVisitor();
    const pstate: AnalyzerVisitorContext = {
      ProgramState: {
        blocks: new Map<string, MemoryBlock>(),
        pointers: new Map<string, MemoryPointer>()
      }
    };
    analyzerVistitor.visit(cProgramAST, pstate, analyzerVistitor);

    return testing ? this.getTestData(textDocument): errors;
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
    const err2 = ErrBuilder.createMemErr(
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
