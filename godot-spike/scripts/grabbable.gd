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
	MassCategory.LIGHT: 14.0,
	MassCategory.MEDIUM: 10.0,
	MassCategory.HEAVY: 6.0,
}
const HARD_LANDING_SPEED := 5.0

var mass_category: int = MassCategory.MEDIUM
var display_name := "object"
var hold_offset := Vector3(0.0, -0.7, 0.0)
var held_wiggle_amp := 0.0
var is_held := false
var is_airborne := false
var start_frozen := false

var _hold_target := Vector3.ZERO
var _wiggle_t := 0.0
var _hover_mats: Array[StandardMaterial3D] = []

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
	if is_held:
		var k := 1.0 - exp(-float(CARRY_LAG[mass_category]) * delta)
		var target := _hold_target
		if held_wiggle_amp > 0.0:
			_wiggle_t += delta * 9.0
			target += Vector3(sin(_wiggle_t) * held_wiggle_amp, 0.0, cos(_wiggle_t * 1.3) * held_wiggle_amp)
		global_position = global_position.lerp(target, k)

func set_hold_target(pos: Vector3) -> void:
	_hold_target = pos

func set_hover(on: bool) -> void:
	for m in _hover_mats:
		m.emission_energy_multiplier = 0.9 if on else 0.0

func begin_hold() -> void:
	is_held = true
	is_airborne = false
	freeze_mode = RigidBody3D.FREEZE_MODE_KINEMATIC
	freeze = true
	_hold_target = global_position + Vector3(0.0, 0.5, 0.0)
	_on_grabbed()

## velocity_world is the raw sampled hand velocity; class scaling happens here.
func release(velocity_world: Vector3, throw_min_speed: float) -> void:
	is_held = false
	freeze = false
	var v := velocity_world * float(THROW_MULTIPLIER[mass_category])
	var cap := float(THROW_CLAMP[mass_category])
	if v.length() > cap:
		v = v.normalized() * cap
	if velocity_world.length() < throw_min_speed:
		linear_velocity = Vector3.ZERO
		angular_velocity = Vector3.ZERO
		_on_released()
	else:
		linear_velocity = v
		angular_velocity = Vector3(randf() - 0.5, randf() - 0.5, randf() - 0.5) * 3.0
		is_airborne = true
		_on_thrown(v)

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
