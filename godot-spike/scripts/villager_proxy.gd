extends Grabbable
## Villager — an emotional witness, not a resource. Wanders, notices the
## hand, fears grabs and throws, prays at blessings, asks "Who are you?".
## Frozen-kinematic while walking; real physics while thrown.

signal command_arrived

enum VState { IDLE, WALK, NOTICE, PRAY, FLEE, COWER, KNOCKED, HELD, AIRBORNE, COMMAND }

const WALK_SPEED := 1.3
const FLEE_SPEED := 3.2
const NOTICE_RADIUS := 4.5
const NOTICE_HAND_HEIGHT := 2.6

var vstate: int = VState.IDLE
var home := Vector3.ZERO
var panicking := false

var _walk_target := Vector3.ZERO
var _command_target := Vector3.ZERO
var _has_command := false
var _state_timer := 0.0
var _idle_wait := 1.5
var _flee_from := Vector3.ZERO
var _pray_toward := Vector3.ZERO
var _pivot: Node3D
var _question: Label3D
var _shake_t := 0.0
var _recover_timer := 0.0

func _configure() -> void:
	mass_category = MassCategory.LIGHT
	mass = 9.0
	display_name = "villager"
	hold_offset = Vector3(0.0, -0.6, -0.08)
	pick_anchor_offset = Vector3(0.0, 0.78, 0.0)
	hover_screen_radius = 58.0
	ground_clearance = 0.85
	held_wiggle_amp = 0.06
	start_frozen = true

func _build_body() -> void:
	add_to_group("villager")
	_pivot = Node3D.new()
	_pivot.name = "BodyPivot"
	add_child(_pivot)
	var tint := randf_range(0.0, 0.25)
	var body := MeshInstance3D.new()
	var cap := CapsuleMesh.new()
	cap.radius = 0.26
	cap.height = 1.05
	body.mesh = cap
	body.position = Vector3(0.0, 0.0, 0.0)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.62 + tint, 0.4, 0.3)
	mat.emission_enabled = true
	mat.emission = Color(1.0, 0.9, 0.6)
	mat.emission_energy_multiplier = 0.0
	_hover_mats.append(mat)
	body.material_override = mat
	_pivot.add_child(body)
	var head := MeshInstance3D.new()
	var sph := SphereMesh.new()
	sph.radius = 0.17
	sph.height = 0.34
	head.mesh = sph
	head.position = Vector3(0.0, 0.72, 0.0)
	head.material_override = mat
	_pivot.add_child(head)
	_add_collider(_make_capsule_shape())
	_question = Label3D.new()
	_question.text = "Who are you?"
	_question.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	_question.font_size = 96
	_question.pixel_size = 0.01
	_question.modulate = Color(1.0, 0.95, 0.8)
	_question.outline_size = 12
	_question.position = Vector3(0.0, 1.5, 0.0)
	_question.visible = false
	add_child(_question)
	var director := get_tree().get_first_node_in_group("witness_director")
	if director:
		director.god_event.connect(_on_god_event)

func _make_capsule_shape() -> CapsuleShape3D:
	var shape := CapsuleShape3D.new()
	shape.radius = 0.28
	shape.height = 1.15
	return shape

func _physics_process(delta: float) -> void:
	super(delta)
	if is_held:
		vstate = VState.HELD
		_apply_panic_shake(delta)
		return
	if is_airborne or not freeze:
		vstate = VState.AIRBORNE if is_airborne else vstate
		_recover_timer += delta
		if not is_airborne and (sleeping or _recover_timer > 4.0):
			_stand_up()
		return
	_state_timer -= delta
	match vstate:
		VState.IDLE:
			_look_for_hand()
			if _state_timer <= 0.0:
				_pick_wander_target()
		VState.WALK:
			_look_for_hand()
			_step_toward(_walk_target, WALK_SPEED, delta)
			if _flat(global_position).distance_to(_flat(_walk_target)) < 0.4:
				_enter_idle()
		VState.NOTICE:
			var hand := _hand()
			if hand:
				_face_point(hand.global_position)
			if not _hand_is_near():
				_resume_after_interrupt()
		VState.PRAY:
			_face_point(_pray_toward)
			_pivot.rotation.x = lerpf(_pivot.rotation.x, -0.5, 5.0 * delta)
			_pivot.scale.y = lerpf(_pivot.scale.y, 0.8, 5.0 * delta)
			if _state_timer <= 0.0:
				_reset_pose()
				_resume_after_interrupt()
		VState.FLEE:
			var away := _flat(global_position) - _flat(_flee_from)
			var dir := away.normalized() if away.length() > 0.01 else Vector2.RIGHT
			_step_dir(dir, FLEE_SPEED, delta)
			if _state_timer <= 0.0:
				_resume_after_interrupt()
		VState.COWER:
			_pivot.scale.y = lerpf(_pivot.scale.y, 0.55, 6.0 * delta)
			if _state_timer <= 0.0:
				_reset_pose()
				_resume_after_interrupt()
		VState.KNOCKED:
			_pivot.rotation.x = lerpf(_pivot.rotation.x, deg_to_rad(88.0), 8.0 * delta)
			if _state_timer <= 0.0:
				_reset_pose()
				_flee_from = global_position + Vector3(randf() - 0.5, 0.0, randf() - 0.5)
				_set_state(VState.FLEE, 1.6)
		VState.COMMAND:
			_step_toward(_command_target, WALK_SPEED * 1.25, delta)
			if _flat(global_position).distance_to(_flat(_command_target)) < 0.5:
				_has_command = false
				_set_state(VState.IDLE, 999.0)
				command_arrived.emit()

# --- Witness reactions -----------------------------------------------------

func _on_god_event(kind: String, pos: Vector3, data: Dictionary) -> void:
	if is_held or is_airborne or not freeze:
		return
	if vstate == VState.COMMAND or vstate == VState.KNOCKED:
		return
	var d := global_position.distance_to(pos)
	match kind:
		"grab":
			if d < 6.0 and data.get("class", "") == "villager" and pos.distance_to(global_position) > 0.1:
				_flee_from = pos
				_set_state(VState.FLEE, 0.9)
		"throw":
			if d < 7.0:
				_flee_from = pos
				_set_state(VState.FLEE, 1.4)
		"land_hard":
			if d < 8.0:
				_flee_from = pos
				_set_state(VState.FLEE, 1.2)
				await get_tree().create_timer(1.2).timeout
				if vstate == VState.FLEE or vstate == VState.IDLE:
					_set_state(VState.COWER, 1.8)
		"land_gentle":
			if d < 5.0 and data.get("class", "") == "villager":
				_bow()
		"blessing":
			if d < 9.0:
				_pray_toward = pos
				_set_state(VState.PRAY, 4.0)
		"bolt":
			if d < 9.0:
				_flee_from = pos
				_set_state(VState.FLEE, 1.8)
		"bolt_learned":
			if d < 10.0:
				_pray_toward = pos
				_set_state(VState.PRAY, 2.5)
		"symbol_painted":
			if d < 11.0:
				_face_point(pos)
				_bow()

# --- Grabbable hooks -------------------------------------------------------

func _on_grabbed() -> void:
	_question.visible = false
	_reset_pose()
	var director := get_tree().get_first_node_in_group("witness_director")
	if director:
		director.announce("grab", global_position, {"class": display_name})

func _on_thrown(_v: Vector3) -> void:
	set_panic(false)
	var director := get_tree().get_first_node_in_group("witness_director")
	if director:
		director.announce("throw", global_position, {"class": display_name})

func _on_released() -> void:
	set_panic(false)
	_recover_timer = 3.5   # gentle set-down: stand up almost immediately

func _on_landed(impact: float) -> void:
	_recover_timer = 0.0
	if impact > HARD_LANDING_SPEED:
		_pending_knock = true

var _pending_knock := false

func _stand_up() -> void:
	freeze_mode = RigidBody3D.FREEZE_MODE_KINEMATIC
	freeze = true
	linear_velocity = Vector3.ZERO
	angular_velocity = Vector3.ZERO
	rotation = Vector3.ZERO
	var island := get_tree().get_first_node_in_group("island")
	if island:
		global_position.y = island.height_at(global_position.x, global_position.z) + 0.85
	_recover_timer = 0.0
	if _pending_knock:
		_pending_knock = false
		_set_state(VState.KNOCKED, 2.6)
	elif _has_command:
		_set_state(VState.COMMAND, 999.0)
	else:
		_enter_idle()

# --- Commands (symbol ritual) ----------------------------------------------

func command_move_to(p: Vector3) -> void:
	_command_target = p
	_has_command = true
	_reset_pose()
	_set_state(VState.COMMAND, 999.0)

func show_question(on: bool) -> void:
	_question.visible = on

func resume_idle() -> void:
	_has_command = false
	_enter_idle()

func set_panic(on: bool) -> void:
	panicking = on

# --- Helpers ----------------------------------------------------------------

func _apply_panic_shake(delta: float) -> void:
	if panicking:
		_shake_t += delta * 40.0
		_pivot.rotation.z = sin(_shake_t) * 0.22
		_pivot.rotation.x = cos(_shake_t * 1.4) * 0.14
	else:
		_pivot.rotation.z = lerpf(_pivot.rotation.z, 0.0, 10.0 * delta)
		_pivot.rotation.x = lerpf(_pivot.rotation.x, 0.0, 10.0 * delta)

func _bow() -> void:
	var tw := create_tween()
	tw.tween_property(_pivot, "rotation:x", 0.55, 0.35)
	tw.tween_interval(0.5)
	tw.tween_property(_pivot, "rotation:x", 0.0, 0.4)

func _reset_pose() -> void:
	_pivot.rotation = Vector3.ZERO
	_pivot.scale = Vector3.ONE

func _enter_idle() -> void:
	vstate = VState.IDLE
	_state_timer = randf_range(1.2, 4.0)

func _set_state(s: int, t: float) -> void:
	vstate = s
	_state_timer = t

func _resume_after_interrupt() -> void:
	if _has_command:
		_set_state(VState.COMMAND, 999.0)
	else:
		_enter_idle()

func _pick_wander_target() -> void:
	var ang := randf() * TAU
	var r := randf_range(1.0, 5.0)
	_walk_target = home + Vector3(cos(ang) * r, 0.0, sin(ang) * r)
	vstate = VState.WALK

func _step_toward(target: Vector3, speed: float, delta: float) -> void:
	var dir := _flat(target) - _flat(global_position)
	if dir.length() < 0.01:
		return
	_step_dir(dir.normalized(), speed, delta)

func _step_dir(dir: Vector2, speed: float, delta: float) -> void:
	var island := get_tree().get_first_node_in_group("island")
	var nx := global_position.x + dir.x * speed * delta
	var nz := global_position.z + dir.y * speed * delta
	if Vector2(nx, nz).length() > 22.0:
		return   # never walk into the sea
	var ny := global_position.y
	if island:
		ny = island.height_at(nx, nz) + 0.85
	global_position = Vector3(nx, ny, nz)
	_face_point(global_position + Vector3(dir.x, 0.0, dir.y))

func _face_point(p: Vector3) -> void:
	var d := _flat(p) - _flat(global_position)
	if d.length() > 0.05:
		rotation.y = atan2(d.x, d.y)

func _look_for_hand() -> void:
	if _hand_is_near():
		_set_state(VState.NOTICE, 999.0)

func _hand_is_near() -> bool:
	var hand := _hand()
	if hand == null:
		return false
	var hp: Vector3 = hand.global_position
	if hp.distance_to(global_position) > NOTICE_RADIUS:
		return false
	var island := get_tree().get_first_node_in_group("island")
	var ground: float = island.height_at(hp.x, hp.z) if island else 0.0
	return hp.y - ground < NOTICE_HAND_HEIGHT

func _hand() -> Node3D:
	return get_tree().get_first_node_in_group("divine_hand")

func _flat(v: Vector3) -> Vector2:
	return Vector2(v.x, v.z)
