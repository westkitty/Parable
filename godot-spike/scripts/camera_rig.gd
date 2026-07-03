extends Node3D
## Camera rig — yaw (self) → Pitch → Camera3D. Pan is driven by hand_input
## (LMB ground-grip); orbit and zoom are handled here. The rig never moves
## on its own except the scripted temple transitions driven by world.gd.

const ORBIT_SENS := 0.008
const PITCH_MIN := deg_to_rad(-80.0)
const PITCH_MAX := deg_to_rad(-15.0)
const DIST_MIN := 7.0
const DIST_MAX := 55.0
const ZOOM_FACTOR := 1.12
const ZOOM_PULL := 0.3
const SCREEN_PAN_SCALE := 0.018
const KEY_ORBIT_STEP := 0.095
const KEY_PITCH_STEP := 0.06
const DEFAULT_POS := Vector3(0.0, 6.0, 3.5)
const DEFAULT_PITCH := -56.0
const DEFAULT_DIST := 26.0

var camera: Camera3D
var locked := false            # true during gesture drawing + temple transitions
var control_scale := 1.0       # reduced while carrying
var dist := 26.0

var _pitch: Node3D
var _dist_target := 26.0
var _orbiting := false
var _orbit_fallback := false
var _middle_button_down := false
var _orbit_source := "none"
var _default_state := {}

func _ready() -> void:
	add_to_group("camera_rig")
	_pitch = $Pitch
	camera = $Pitch/Camera3D
	position = DEFAULT_POS
	_pitch.rotation.x = deg_to_rad(DEFAULT_PITCH)
	camera.position = Vector3(0.0, 0.0, dist)
	camera.far = 300.0
	_dist_target = dist
	_default_state = save_state()

func _process(delta: float) -> void:
	dist = lerpf(dist, _dist_target, 1.0 - exp(-10.0 * delta))
	camera.position = Vector3(0.0, 0.0, dist)

func _input(event: InputEvent) -> void:
	if locked:
		return
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_MIDDLE:
			_middle_button_down = event.pressed
			_orbiting = event.pressed
			_orbit_source = "middle" if event.pressed else "none"
		elif event.button_index == MOUSE_BUTTON_LEFT:
			_orbit_fallback = event.pressed and (event.alt_pressed or event.shift_pressed)
			if _orbit_fallback:
				_orbit_source = "alt_left" if event.alt_pressed else "shift_left"
			elif not event.pressed and not _middle_button_down:
				_orbit_source = "none"
		elif event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_UP:
			_zoom(1.0 / ZOOM_FACTOR)
		elif event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			_zoom(ZOOM_FACTOR)
	elif event is InputEventMouseMotion:
		var middle_motion := bool(event.button_mask & MOUSE_BUTTON_MASK_MIDDLE)
		if middle_motion and not _middle_button_down:
			_middle_button_down = true
			_orbiting = true
			_orbit_source = "middle"
		if is_orbiting():
			_apply_orbit(event.relative)
	elif event is InputEventKey and event.pressed and not event.echo:
		match event.keycode:
			KEY_Q:
				orbit_step(-1.0)
			KEY_E:
				orbit_step(1.0)
			KEY_W:
				pitch_step(1.0)
			KEY_S:
				pitch_step(-1.0)
			KEY_R:
				reset_to_safe_default()
			KEY_EQUAL, KEY_PLUS, KEY_KP_ADD:
				_zoom(1.0 / ZOOM_FACTOR)
			KEY_MINUS, KEY_KP_SUBTRACT:
				_zoom(ZOOM_FACTOR)

func is_orbiting() -> bool:
	return (_orbiting or _orbit_fallback) and not locked

func orbit_modifier_active() -> bool:
	return (Input.is_key_pressed(KEY_SHIFT) or Input.is_key_pressed(KEY_ALT) or _orbit_fallback) and not locked

func middle_button_down() -> bool:
	return _middle_button_down

func orbit_source() -> String:
	return _orbit_source if is_orbiting() else "none"

func camera_mode() -> String:
	if locked:
		return "locked"
	if is_orbiting():
		return "orbit"
	return "free"

func orbit_step(direction: float) -> void:
	rotation.y += KEY_ORBIT_STEP * direction * control_scale
	_orbit_source = "key"

func pitch_step(direction: float) -> void:
	_pitch.rotation.x = clampf(_pitch.rotation.x - KEY_PITCH_STEP * direction * control_scale, PITCH_MIN, PITCH_MAX)

func pan_screen_delta(delta: Vector2) -> void:
	if locked:
		return
	var right := camera.global_transform.basis.x
	var forward := -camera.global_transform.basis.z
	right.y = 0.0
	forward.y = 0.0
	right = right.normalized()
	forward = forward.normalized()
	var scale := maxf(dist * SCREEN_PAN_SCALE * control_scale, 0.01)
	var offset := (-right * delta.x + forward * delta.y) * scale
	pan_by(offset)

func target_position() -> Vector3:
	return position

func simulate_orbit_drag(delta: Vector2) -> void:
	_apply_orbit(delta)

func simulate_zoom_factor(factor: float) -> void:
	_zoom(factor)

func _zoom(factor: float) -> void:
	_dist_target = clampf(_dist_target * factor, DIST_MIN, DIST_MAX)
	if factor < 1.0:
		# Zoom-to-hand: drift the pivot toward the point under the hand.
		var hand := get_tree().get_first_node_in_group("divine_hand")
		if hand:
			var target: Vector3 = hand.global_position
			var offset := Vector3(target.x - position.x, 0.0, target.z - position.z)
			position += offset * ZOOM_PULL * control_scale

func pan_by(offset: Vector3) -> void:
	if locked:
		return
	position += Vector3(offset.x, 0.0, offset.z)
	position.x = clampf(position.x, -40.0, 40.0)
	position.z = clampf(position.z, -40.0, 40.0)

func reset_to_safe_default() -> void:
	restore_state(_default_state)

func _apply_orbit(delta: Vector2) -> void:
	rotation.y -= delta.x * ORBIT_SENS * control_scale
	_pitch.rotation.x = clampf(
		_pitch.rotation.x - delta.y * ORBIT_SENS * control_scale,
		PITCH_MIN, PITCH_MAX)

## Ray from the active camera through a screen position.
func screen_ray(screen_pos: Vector2) -> Array:
	return [camera.project_ray_origin(screen_pos), camera.project_ray_normal(screen_pos)]

func save_state() -> Dictionary:
	return {
		"pos": position, "yaw": rotation.y,
		"pitch": _pitch.rotation.x, "dist": _dist_target,
	}

func restore_state(s: Dictionary) -> void:
	position = s.pos
	rotation.y = s.yaw
	_pitch.rotation.x = s.pitch
	_dist_target = s.dist
	dist = s.dist

## Scripted doorway approach used by the temple transition.
func fly_toward(point: Vector3, target_dist: float, seconds: float) -> Signal:
	locked = true
	var tw := create_tween().set_parallel(true)
	tw.tween_property(self, "position", Vector3(point.x, 4.0, point.z + 4.0), seconds) \
		.set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	tw.tween_property(self, "_dist_target", target_dist, seconds)
	return tw.finished
