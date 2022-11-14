import { execSync } from 'child_process';

export default class CParser {
  static getAST(cProgram: string): object {
    const output = execSync(`echo "int main(void) { return 0; }" | clang -x c - -Xclang -ast-dump=json -fsyntax-only`, {
      maxBuffer: Number.MAX_SAFE_INTEGER,
      encoding: 'utf8'
    });
    const ast = JSON.parse(output);
    return ast as unknown as object;
  }
}
