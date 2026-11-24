// Every tuning threshold for M1 lives here so feel can be tuned in one place.
export const WORLD_SIZE = 160; // metres, square valley centred on origin
export const WATER_LEVEL = 0;
export const SIM_HZ = 20;
export const SIM_DT = 1 / SIM_HZ;
export const PHYSICS_HZ = 60;

// Hand
export const HAND_HOVER_HEIGHT = 1.2;
export const HAND_CARRY_HEIGHT = 2.6;
export const HAND_HOVER_PICK_RADIUS = 1.8; // metres from hand ground point to an object centre
export const THROW_MIN_SPEED = 1.8; // m/s: below = gentle set-down
export const THROW_VERTICAL_LIFT = 2.35;
export const THROW_SAMPLE_WINDOW_MS = 110;
export const THROW_MAX_SPEED = 38;

// Camera
export const CAM_MIN_DIST = 4;
export const CAM_MAX_DIST = 95;
export const CAM_DEFAULT_DIST = 62;
export const CAM_PITCH_NEAR = 0.32; // radians above horizon when close
export const CAM_PITCH_FAR = 1.0;
export const CLICK_DRAG_THRESHOLD_PX = 10;

// Ritual
export const ACCEPT_COUNTERCLOCKWISE = false; // protected law: clockwise spiral opens the ritual
export const RITUAL_ARM_MS = 5600;
export const GESTURE_POINT_STEP_PX = 4;
export const GESTURE_IDLE_RESET_MS = 380;
export const GESTURE_MAX_STROKE_MS = 4500;

// Settler
export const SETTLER_WALK_SPEED = 1.7;
export const SETTLER_FLEE_SPEED = 4.2;
export const WITNESS_RADIUS = 18;
export const CALM_AFTER_S = 10;
export const BRUISE_S = 60;
export const MEMORY_MAX = 8;

// Fire
export const FIRE_CELL = 2; // metres
export const FIRE_IGNITE_RADIUS = 3;
export const FIRE_BURN_S = 9;
