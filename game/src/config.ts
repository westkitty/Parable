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

// ---- M2: the working village ----
export const DAY_S = 90; // one in-game day of the Dry Year, in real seconds at normal speed
export const DAY_TICKS = DAY_S * SIM_HZ;
export const HUNGER_DAYS = 1.4; // fed -> starving
export const ENERGY_DAYS = 1.3; // rested -> exhausted while working
export const HEAL_PER_DAY = 0.15; // natural healing
export const STARVE_PER_DAY = 0.5; // injury per day once starving (was 0.15: famine never killed inside the year)
export const TEND_HEAL = 0.25; // one carer visit
export const LAID_UP_AT = 0.6; // injury at which a villager can no longer work
export const CHOP_S = 6;
export const BUILD_S = 5;
export const FARM_S = 3.5;
export const EAT_S = 3;
export const REST_S = 12;
export const PRAY_S = 4;
export const PAINT_S = 5;
export const TEND_S = 5;
export const FETCH_S = 1.2;
export const HOUSE_WOOD = 8;
export const REBUILD_WOOD = 5;
export const WOODPILE_TARGET = 14; // woodcutters stop felling when the pile is this high
export const START_FOOD = 30;
export const START_WOOD = 3;
export const FOOD_PER_HARVEST = 3;

// ---- M3: belief and miracles ----
export const START_POWER = 70;
export const POWER_MAX = 100;
export const MIRACLE_COST: Record<string, number> = { fireball: 20, rain: 30, sanctuary: 40, heal: 25, lightning: 20, fertility: 25, wind: 15, stone: 30, beacon: 10, golem: 30 };
export const PRAY_MIN_BELIEF = 25;
export const PAINT_MIN_VILLAGE_BELIEF = 30;
export const RAIN_S = 24;
export const RAIN_RADIUS = 8;
export const WET_S = 40;
export const SANCTUARY_S = 60;
export const SANCTUARY_RADIUS = 9;
export const SHRINE_ALTAR_RADIUS = 2.4;
export const STUDY_MURAL_S = 1.2;

// ---- M4: the Dry Year ----
export const DRY_YEAR_DAYS = 10;
export const LIGHTNING_DAY = 5;
export const SECOND_STRIKE_DAY = 8; // a second dry storm late in the year: neglect compounds
export const EMBER_RATE = 0.008; // spot-fire chance per burning cell per second (scaled by drought above 0.4 and wind)
export const SMOKE_HURT_PER_S = 0.05; // injury per second standing beside (not in) a burning cell
export const SURVIVE_MIN_ALIVE = 4;

// ---- M4+: ten miracles and golems ----
export const HEAL_RADIUS = 7;
export const FERTILITY_RADIUS = 12;
export const LIGHTNING_HURT_RADIUS = 3;
export const WIND_S = 12;
export const WIND_RADIUS = 14;
export const STONE_RADIUS = 3.2;
export const BEACON_S = 40;
export const GLYPH_STONE_TRACE_RADIUS = 12;
export const GOLEM_WOOD = 4; // logs laid in the golem ring form one dormant wooden golem
export const GOLEM_SPEED = 0.7; // x a villager's walk: golems are slow
export const GOLEM_UPKEEP_PER_DAY = 5; // prayer power per awake golem per day (was 3; prayer income averages ~18/day, measured seed 7)
export const GOLEM_JOB_UPKEEP_PER_DAY = 4; // extra when it has a job: one working golem costs half the faith, two cost all of it
export const GOLEM_MAX = 3;
