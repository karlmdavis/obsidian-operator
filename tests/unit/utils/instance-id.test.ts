import { expect, test } from "bun:test";
import {
	generateInstanceId,
	getInstanceTimestamp,
	isInstanceType,
	isValidInstanceId,
	parseInstanceId,
} from "../../../src/utils/instance-id.js";

/**
 * Test suite for instance ID utility functions.
 *
 * These tests verify that instance ID generation and parsing work correctly
 * and provide the type safety guarantees expected throughout the plugin.
 */

test("generateInstanceId creates properly formatted IDs", async () => {
	const modalId = generateInstanceId("modal");
	const viewId = generateInstanceId("view");
	const commandId = generateInstanceId("command");

	// Should follow the expected pattern
	expect(modalId).toMatch(/^modal-\d+$/);
	expect(viewId).toMatch(/^view-\d+$/);
	expect(commandId).toMatch(/^command-\d+$/);

	// Should generate unique IDs (using timestamp, so they should be different unless called in the same millisecond)
	const id1 = generateInstanceId("modal");
	// Add a small delay to ensure different timestamps
	await new Promise((resolve) => setTimeout(resolve, 1));
	const id2 = generateInstanceId("modal");
	expect(id1).not.toBe(id2);
});

test("parseInstanceId correctly parses valid IDs", () => {
	const timestamp = Date.now();
	const testId = `modal-${timestamp}`;

	const parsed = parseInstanceId(testId);

	expect(parsed).not.toBeNull();
	expect(parsed?.type).toBe("modal");
	expect(parsed?.timestamp).toBe(timestamp);
});

test("parseInstanceId returns null for invalid IDs", () => {
	const invalidIds = [
		"invalid-format",
		"modal",
		"123-modal",
		"modal-abc",
		"unknown-123",
		"",
		"modal-123-extra",
	];

	for (const invalidId of invalidIds) {
		expect(parseInstanceId(invalidId)).toBeNull();
	}
});

test("isValidInstanceId correctly validates IDs", () => {
	// Valid IDs
	expect(isValidInstanceId("modal-123456789")).toBe(true);
	expect(isValidInstanceId("view-987654321")).toBe(true);
	expect(isValidInstanceId("command-111222333")).toBe(true);

	// Invalid IDs
	expect(isValidInstanceId("invalid-format")).toBe(false);
	expect(isValidInstanceId("modal")).toBe(false);
	expect(isValidInstanceId("123-modal")).toBe(false);
	expect(isValidInstanceId("")).toBe(false);
});

test("isInstanceType correctly identifies instance types", () => {
	const modalId = "modal-123456789";
	const viewId = "view-987654321";
	const commandId = "command-555666777";

	expect(isInstanceType(modalId, "modal")).toBe(true);
	expect(isInstanceType(modalId, "view")).toBe(false);
	expect(isInstanceType(modalId, "command")).toBe(false);

	expect(isInstanceType(viewId, "view")).toBe(true);
	expect(isInstanceType(viewId, "modal")).toBe(false);
	expect(isInstanceType(viewId, "command")).toBe(false);

	expect(isInstanceType(commandId, "command")).toBe(true);
	expect(isInstanceType(commandId, "modal")).toBe(false);
	expect(isInstanceType(commandId, "view")).toBe(false);

	// Invalid ID should return false for all types
	expect(isInstanceType("invalid-id", "modal")).toBe(false);
});

test("getInstanceTimestamp extracts timestamp correctly", () => {
	const timestamp = 1640995200000; // Known timestamp
	const testId = `view-${timestamp}`;

	expect(getInstanceTimestamp(testId)).toBe(timestamp);
	expect(getInstanceTimestamp("invalid-id")).toBeNull();
});

test("type safety integration - generated IDs work with type system", () => {
	// This test demonstrates that the generated IDs work with the type system
	const modalId = generateInstanceId("modal");
	const viewId = generateInstanceId("view");

	// These should be type-safe assignments
	const testModalId: string = modalId;
	const testViewId: string = viewId;

	// Should be able to use as instance IDs
	expect(isValidInstanceId(testModalId)).toBe(true);
	expect(isValidInstanceId(testViewId)).toBe(true);

	// Should preserve type information
	expect(isInstanceType(modalId, "modal")).toBe(true);
	expect(isInstanceType(viewId, "view")).toBe(true);
});

test("timestamp ordering for chronological analysis", async () => {
	// Generate IDs in sequence
	const id1 = generateInstanceId("modal");
	// Small delay to ensure different timestamps
	await new Promise((resolve) => setTimeout(resolve, 1));
	const id2 = generateInstanceId("modal");

	const timestamp1 = getInstanceTimestamp(id1);
	const timestamp2 = getInstanceTimestamp(id2);

	expect(timestamp1).not.toBeNull();
	expect(timestamp2).not.toBeNull();

	// Second ID should have timestamp > first (due to the delay)
	expect(timestamp2! > timestamp1!).toBe(true);
});

test("integration with plugin patterns", () => {
	// Test the patterns that would be used in the actual plugin
	const recordingModalId = generateInstanceId("modal");
	const recordingViewId = generateInstanceId("view");

	// Simulate checking if an ID belongs to a modal (useful for cleanup)
	const modalIds = [recordingModalId, recordingViewId].filter((id) => isInstanceType(id, "modal"));

	expect(modalIds).toHaveLength(1);
	expect(modalIds[0]).toBe(recordingModalId);

	// Simulate getting creation time for debugging
	const creationTime = getInstanceTimestamp(recordingModalId);
	expect(creationTime).toBeGreaterThan(0);
	expect(new Date(creationTime!).getFullYear()).toBe(new Date().getFullYear());
});
