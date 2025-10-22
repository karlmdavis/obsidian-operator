/**
 * Coverage Helper Test
 *
 * This test file dynamically imports all source files to ensure they appear in coverage reports.
 * This is a workaround for Bun's current limitation where only imported files
 * are included in coverage calculations.
 *
 * Features:
 * - Dynamically discovers all TypeScript source files
 * - Mocks the 'obsidian' package to allow importing files that depend on it
 * - Ensures complete coverage reporting for all source files
 *
 * This can be removed once Bun adds native support for including all source files
 * in coverage reports regardless of whether they're imported during test execution.
 */

import { describe, expect, test } from "bun:test";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Recursively find all TypeScript files in a directory
 */
function findTypeScriptFiles(dir: string, baseDir: string = dir): string[] {
	const files: string[] = [];
	const entries = readdirSync(dir);

	for (const entry of entries) {
		const fullPath = join(dir, entry);
		const stat = statSync(fullPath);

		if (stat.isDirectory()) {
			// Recursively search subdirectories
			files.push(...findTypeScriptFiles(fullPath, baseDir));
		} else if (entry.endsWith(".ts") && !entry.endsWith(".d.ts")) {
			// Include .ts files but exclude .d.ts declaration files
			const relativePath = relative(baseDir, fullPath);
			files.push(relativePath);
		}
	}

	return files;
}

/**
 * Convert a TypeScript file path to an import path
 * Note: Bun/Node resolve .ts imports as .js at runtime
 */
function toImportPath(filePath: string): string {
	// Remove .ts extension and prepend ../src/
	return `../src/${filePath.replace(/\.ts$/, "")}`;
}

describe("Coverage Helper", () => {
	test("should dynamically import all source files for accurate coverage reporting", async () => {
		const srcDir = join(process.cwd(), "src");
		const sourceFiles = findTypeScriptFiles(srcDir);

		console.log(`Found ${sourceFiles.length} TypeScript files to import for coverage:`);

		const importResults: { file: string; success: boolean; error?: string }[] = [];

		for (const file of sourceFiles) {
			const importPath = toImportPath(file);

			try {
				// Dynamically import the file
				await import(importPath);
				importResults.push({ file, success: true });
				console.log(`  ✓ ${file}`);
			} catch (error) {
				// Record failed imports but don't fail the test
				// Some files might have initialization code that fails in test environment
				const errorMessage = error instanceof Error ? error.message : String(error);
				importResults.push({ file, success: false, error: errorMessage });
				console.log(`  ✗ ${file}: ${errorMessage}`);
			}
		}

		// Report statistics
		const successful = importResults.filter((r) => r.success).length;
		const failed = importResults.filter((r) => !r.success).length;

		console.log("\nCoverage import summary:");
		console.log(`  Successfully imported: ${successful}/${sourceFiles.length} files`);
		if (failed > 0) {
			console.log(`  Failed imports: ${failed} files`);
			console.log("  Failed files:");
			for (const r of importResults.filter((r) => !r.success)) {
				console.log(`    - ${r.file}: ${r.error}`);
			}
		}

		// The test passes as long as we attempted to import all files
		// This ensures they're included in coverage even if some fail to initialize
		expect(sourceFiles.length).toBeGreaterThan(0);
		expect(importResults.length).toBe(sourceFiles.length);
	});
});
