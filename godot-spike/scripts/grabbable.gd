class_name Grabbable
extends RigidBody3D
## Base class for everything the divine hand can pick up. The grabbable set
## is explicit and never changes at runtime (doctrine). Held bodies are
## frozen kinematic and follow the hand with a weight-scaled lag; release
## hands them back to physics with the sampled throw velocity.

enum MassCategory { LIGHT, MEDIUM, HEAVY }

const THROW_MULTIPLIER := {
	MassCategory.LIGHT: 1.0,
	MassCategory.MEDIUM: 0.75,
	MassCategory.HEAVY: 0.4,
}
const THROW_CLAMP := {
	MassCategory.LIGHT: 18.0,
	MassCategory.MEDIUM: 14.0,
	MassCategory.HEAVY: 8.0,
}
const CARRY_LAG := {
	MassCategory.LIGHT: 28.0,
	MassCategory.MEDIUM: 22.0,
	MassCategory.HEAVY: 16.0,
}
const HARD_LANDING_SPEED := 5.0
const SURFACE_RECOVERY_MARGIN := 1.6
const ABSOLUTE_FLOOR_Y := -12.0

signal released(obj: Grabbable, mode: String, at: Vector3, speed: float)

var mass_category: int = MassCategory.MEDIUM
var display_name := "object"
var hold_offset := Vector3(0.0, -0.7, 0.0)
var pick_anchor_offset := Vector3.ZERO
var hover_screen_radius := 54.0
var ground_clearance := 0.7
var held_wiggle_amp := 0.0
var is_held := false
var is_airborne := false
var start_frozen := false
var recovery_count := 0
var last_recovery_reason := "-"
var last_release_mode := "-"
var last_release_speed := 0.0
var recent_gentle_release := false

var _hold_target := Vector3.ZERO
var _wiggle_t := 0.0
var _hover_mats: Array[StandardMaterial3D] = []
var _held_visual := false

func _ready() -> void:
	add_to_group("grabbable")
	collision_layer = 2
	collision_mask = 1 | 2
	contact_monitor = true
	max_contacts_reported = 4
	body_entered.connect(_on_body_entered)
	_configure()
	_build_body()
	if start_frozen:
		freeze_mode = RigidBody3D.FREEZE_MODE_KINEMATIC
		freeze = true

## Subclasses set mass_category, mass, display_name, start_frozen, etc.
func _configure() -> void:
	pass

## Subclasses build their meshes + collision shape here.
func _build_body() -> void:
	pass

func _physics_process(delta: float) -> void:
	var island := get_tree().get_first_node_in_group("island")
	_guard_surface_recovery(island)
	if is_held:
		var k := 1.0 - exp(-float(CARRY_LAG[mass_category]) * delta)
		var target: Vector3 = _hold_target
		if held_wiggle_amp > 0.0:
			_wiggle_t += delta * 9.0
			target += Vector3(sin(_wiggle_t) * held_wiggle_amp, 0.0, cos(_wiggle_t * 1.3) * held_wiggle_amp)
		global_position = global_position.lerp(target, k)

func set_hold_target(pos: Vector3) -> void:
	_hold_target = pos

func pick_anchor_point() -> Vector3:
	return global_position + pick_anchor_offset

func set_hover(on: bool) -> void:
	for m in _hover_mats:
		m.emission_energy_multiplier = 0.9 if on else 0.0

func begin_hold() -> void:
	is_held = true
	is_airborne = false
	recent_gentle_release = false
	freeze_mode = RigidBody3D.FREEZE_MODE_KINEMATIC
	freeze = true
	_hold_target = global_position
	set_held_visual(true)
	_on_grabbed()

## velocity_world is the raw sampled hand velocity; class scaling happens here.
func release(velocity_world: Vector3, throw_min_speed: float) -> void:
	is_held = false
	set_held_visual(false)
	var v := velocity_world * float(THROW_MULTIPLIER[mass_category])
	var cap := float(THROW_CLAMP[mass_category])
	if v.length() > cap:
		v = v.normalized() * cap
	if velocity_world.length() < throw_min_speed:
		freeze_mode = RigidBody3D.FREEZE_MODE_KINEMATIC
		freeze = true
		linear_velocity = Vector3.ZERO
		angular_velocity = Vector3.ZERO
		last_release_mode = "drop"
		last_release_speed = 0.0
		recent_gentle_release = true
		_on_released()
		released.emit(self, "drop", global_position, 0.0)
	else:
		freeze = false
		linear_velocity = v
		angular_velocity = Vector3(randf() - 0.5, randf() - 0.5, randf() - 0.5) * 3.0
		is_airborne = true
		last_release_mode = "throw"
		last_release_speed = v.length()
		recent_gentle_release = false
		_on_thrown(v)
		released.emit(self, "throw", global_position, v.length())

func clamp_above_ground(island: Node, xz_override := Vector2.INF) -> void:
	if island == null:
		return
	var px := global_position.x if xz_override == Vector2.INF else xz_override.x
	var pz := global_position.z if xz_override == Vector2.INF else xz_override.y
	var floor_y: float = island.height_at(px, pz) + ground_clearance
	global_position = Vector3(px, maxf(global_position.y, floor_y), pz)

func place_on_surface(island: Node, xz_override := Vector2.INF) -> void:
	if island == null:
		return
	freeze_mode = RigidBody3D.FREEZE_MODE_KINEMATIC
	freeze = true
	linear_velocity = Vector3.ZERO
	angular_velocity = Vector3.ZERO
	var px := global_position.x if xz_override == Vector2.INF else xz_override.x
	var pz := global_position.z if xz_override == Vector2.INF else xz_override.y
	global_position = Vector3(px, island.height_at(px, pz) + ground_clearance, pz)
	recent_gentle_release = true

func surface_height(island: Node) -> float:
	if island == null:
		return ground_clearance
	return island.height_at(global_position.x, global_position.z) + ground_clearance

func _guard_surface_recovery(island: Node) -> void:
	if island == null or is_held:
		return
	var safe_y: float = surface_height(island)
	if global_position.y < ABSOLUTE_FLOOR_Y or global_position.y < safe_y - SURFACE_RECOVERY_MARGIN:
		recovery_count += 1
		last_recovery_reason = "below_floor"
		place_on_surface(island)
		if OS.is_stdout_verbose():
			print("RECOVERED %s to surface at %.2f,%.2f" % [display_name, global_position.x, global_position.z])

func set_held_visual(on: bool) -> void:
	_held_visual = on
	if on:
		set_hover(false)

func _on_body_entered(_body: Node) -> void:
	if not is_airborne:
		return
	is_airborne = false
	var impact := linear_velocity.length()
	_on_landed(impact)
	var director := get_tree().get_first_node_in_group("witness_director")
	if director:
		var kind := "land_hard" if impact > HARD_LANDING_SPEED else "land_gentle"
		director.announce(kind, global_position, {"class": display_name, "impact": impact})

# --- Subclass hooks -------------------------------------------------------
func _on_grabbed() -> void: pass
func _on_released() -> void: pass
func _on_thrown(_v: Vector3) -> void: pass
func _on_landed(_impact: float) -> void: pass

# --- Mesh helpers for subclasses ------------------------------------------
func _add_mesh(mesh: Mesh, color: Color, pos := Vector3.ZERO, glow := true) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	mi.mesh = mesh
	mi.position = pos
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 0.9
	if glow:
		mat.emission_enabled = true
		mat.emission = Color(1.0, 0.9, 0.6)
		mat.emission_energy_multiplier = 0.0
		_hover_mats.append(mat)
	mi.material_override = mat
	add_child(mi)
	return mi

func _add_collider(shape: Shape3D, pos := Vector3.ZERO) -> void:
	var col := CollisionShape3D.new()
	col.shape = shape
	col.position = pos
	add_child(col)
