/**
 * Shared constants used by both the server (run route) and the client (SteerPanel).
 * Keep this file free of server-only or client-only imports.
 */

/** Number of turns a steer directive stays active after being submitted. */
export const STEER_TURNS = 3

/** Default number of extra turns added when resuming with a steer directive. */
export const STEER_EXTRA_TURNS_DEFAULT = 3

/** Maximum extra turns the stepper allows. */
export const STEER_EXTRA_TURNS_MAX = 10
