import type { InstanceId, InstanceType } from "../types/index.js";

/**
 * Utility functions for managing instance identifiers with type safety.
 *
 * These functions ensure that instance IDs follow consistent patterns
 * throughout the plugin and provide compile-time validation of ID formats.
 */

/**
 * Generates a unique instance ID for a UI component.
 * Uses timestamp-based uniqueness to ensure no collisions.
 *
 * @param type - The type of instance (modal, view, command)
 * @returns A type-safe instance ID following the pattern "{type}-{timestamp}"
 */
export function generateInstanceId(type: InstanceType): InstanceId {
	const timestamp = Date.now();
	return `${type}-${timestamp}` as InstanceId;
}

/**
 * Parses an instance ID to extract its type and timestamp components.
 * Provides runtime validation of ID format.
 *
 * @param instanceId - The instance ID to parse
 * @returns Parsed components or null if the ID is malformed
 */
export function parseInstanceId(instanceId: string): {
	type: InstanceType;
	timestamp: number;
} | null {
	const match = instanceId.match(/^(modal|view|command)-(\d+)$/);

	if (!match) {
		return null;
	}

	const [, type, timestampStr] = match;
	const timestamp = Number.parseInt(timestampStr, 10);

	return {
		type: type as InstanceType,
		timestamp,
	};
}

/**
 * Validates that a string is a properly formatted instance ID.
 *
 * @param value - The value to validate
 * @returns True if the value is a valid instance ID
 */
export function isValidInstanceId(value: string): value is InstanceId {
	return parseInstanceId(value) !== null;
}

/**
 * Type guard to check if an instance ID is of a specific type.
 *
 * @param instanceId - The instance ID to check
 * @param type - The type to check for
 * @returns True if the instance ID is of the specified type
 */
export function isInstanceType(instanceId: string, type: InstanceType): boolean {
	const parsed = parseInstanceId(instanceId);
	return parsed?.type === type;
}

/**
 * Gets the creation timestamp from an instance ID.
 *
 * @param instanceId - The instance ID
 * @returns The timestamp when the instance was created, or null if invalid
 */
export function getInstanceTimestamp(instanceId: string): number | null {
	const parsed = parseInstanceId(instanceId);
	return parsed?.timestamp ?? null;
}
