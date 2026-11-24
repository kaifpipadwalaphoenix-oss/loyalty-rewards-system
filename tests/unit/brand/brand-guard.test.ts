import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.html') || file.endsWith('.css')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

describe('Brand Policy & Non-Invented Facts Guards (TC-006, R4.1, R4.2)', () => {
  const srcFiles = getAllFiles(path.resolve(__dirname, '../../../src'));

  it('contains no forbidden generic tier names or wrong staff names in src', () => {
    // Prohibited: silver, bronze, gold (use Shore, Tide, Golden Hour, Endless Summer), Priya (use Pooja)
    const pattern = /\b(silver|bronze|gold|priya)\b/i;
    const violations: { file: string; line: number; match: string }[] = [];

    for (const filePath of srcFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        // Skip comment or population name Priyanka
        if (line.includes('Priyanka')) return;
        if (pattern.test(line)) {
          violations.push({ file: path.relative(process.cwd(), filePath), line: index + 1, match: line.trim() });
        }
      });
    }

    expect(violations).toEqual([]);
  });

  it('contains no invented store location or customer store credit claims', () => {
    // Prohibited: "Bandra", "store credit"
    const pattern = /Bandra|store credit/i;
    const violations: { file: string; line: number; match: string }[] = [];

    for (const filePath of srcFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          violations.push({ file: path.relative(process.cwd(), filePath), line: index + 1, match: line.trim() });
        }
      });
    }

    expect(violations).toEqual([]);
  });

  it('contains no misleading customer copy (online purchases, boutique, permanent bonus, dining) in customer portal (NX-006)', () => {
    // Prohibited in customer copy: "online purchases", "redeem online", "boutique", "permanent bonus", "dining"
    const customerFiles = srcFiles.filter((f) =>
      f.includes('features/customer') ||
      f.includes('features\\customer') ||
      f.includes('components/domain') ||
      f.includes('components\\domain')
    );
    const pattern = /\b(boutique|dining)\b|online purchases?|redeem online|permanent bonus/i;
    const violations: { file: string; line: number; match: string }[] = [];

    for (const filePath of customerFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          violations.push({ file: path.relative(process.cwd(), filePath), line: index + 1, match: line.trim() });
        }
      });
    }

    expect(violations).toEqual([]);
  });
});
