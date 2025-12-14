/**
 * Output writer helper.
 * Handles writing dashboard output to stdout or filesystem.
 */

import * as fs from "fs";
import * as path from "path";

/**
 * Ensure directory exists, creating it if necessary.
 */
export function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Get output directory path for packaged templates.
 */
export function getPackageOutputPath(
  baseDir: string,
  templateName: string,
): string {
  return path.join(baseDir, templateName);
}

/**
 * Write output to stdout.
 */
export function writeToStdout(content: string): void {
  process.stdout.write(content);
}
