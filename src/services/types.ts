/**
 * Type definitions for the recording services layer.
 *
 * These types define the contracts for recording state management
 * and event handling within the services layer.
 */

/**
 * Recording state machine types for managing the lifecycle of recording sessions.
 * These types ensure that state transitions are type-safe and predictable.
 */
export type RecordingState = "idle" | "recording" | "stopping" | "error";

/**
 * Utility types for event handling patterns used by recording services.
 * These provide type safety for frequently used event operations.
 */
export type EventListener<T = unknown> = (event: T) => void;
export type UnsubscribeFunction = () => void;
