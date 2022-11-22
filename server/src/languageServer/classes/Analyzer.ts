import { TextDocument } from 'vscode-languageserver-textdocument';
import { testing } from '../../constants';
import ErrBuilder, { ErrSeverity, MemoryError } from './ErrBuilder';
import { AST } from '../ast/AST';
import { ClogVisitor } from './ClogVisitor';
import {AnalyzerVisitor, AnalyzerVisitorContext} from "./AnalyzerVisitor";
import {MemoryBlock, MemoryPointer, ProgramState} from "./ProgramState";

export default class Analyzer {
  public getAllErrors(cProgramAST: AST, textDocument: TextDocument): MemoryError[] {
    const errors: MemoryError[] = [];
    const clogVisitor = new ClogVisitor();
    if(testing) clogVisitor.visit(cProgramAST, this.getVoid(), clogVisitor);

    const analyzerVistitor = new AnalyzerVisitor();
    const pstate: AnalyzerVisitorContext = {
      ProgramState:{
        blocks: new Map<string, MemoryBlock>(),
        pointers: new Map<string, MemoryPointer>()
      }
    }
    analyzerVistitor.visit(cProgramAST, pstate, analyzerVistitor);

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
