import { writeFileSync } from 'fs';
import path from 'path';

export function syncWriteFile(filename: string, data: string): void {
  writeFileSync(path.join(__dirname, filename), data, {
    flag: 'w'
  });
}
