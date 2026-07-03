extends Node3D
## Camera rig — yaw (self) → Pitch → Camera3D. Pan is driven by hand_input
## (LMB ground-grip); orbit and zoom are handled here. The rig never moves
## on its own except the scripted temple transitions driven by world.gd.

const ORBIT_SENS := 0.0036
const PITCH_MIN := deg_to_rad(-80.0)
const PITCH_MAX := deg_to_rad(-15.0)
const DIST_MIN := 7.0
const DIST_MAX := 55.0
const ZOOM_STEP_SCROLL := 1.75
const ZOOM_STEP_KEYBOARD := 0.85
const SCREEN_PAN_SCALE := 0.026
const KEY_ORBIT_RATE := 1.2
const KEY_PITCH_RATE := 0.9
const CAMERA_SMOOTH := 12.0
const DEFAULT_POS := Vector3(0.0, 6.0, 3.5)
const DEFAULT_PITCH := -56.0
const DEFAULT_DIST := 26.0

var camera: Camera3D
var locked := false            # true during gesture drawing + temple transitions
var control_scale := 1.0       # reserved for scripted/test scaling; carrying does not slow camera
var dist := 26.0

var _pitch: Node3D
var _dist_target := 26.0
var _yaw_target := 0.0
var _pitch_target := deg_to_rad(DEFAULT_PITCH)
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
	_yaw_target = rotation.y
	_pitch_target = _pitch.rotation.x
	_default_state = save_state()

func _process(delta: float) -> void:
	var smooth := 1.0 - exp(-CAMERA_SMOOTH * delta)
	if not locked:
		if Input.is_key_pressed(KEY_Q):
			orbit_step(-KEY_ORBIT_RATE * delta)
		if Input.is_key_pressed(KEY_E):
			orbit_step(KEY_ORBIT_RATE * delta)
		if Input.is_key_pressed(KEY_W):
			pitch_step(KEY_PITCH_RATE * delta)
		if Input.is_key_pressed(KEY_S):
			pitch_step(-KEY_PITCH_RATE * delta)
		if Input.is_key_pressed(KEY_EQUAL) or Input.is_key_pressed(KEY_PLUS) or Input.is_key_pressed(KEY_KP_ADD):
			_zoom(-ZOOM_STEP_KEYBOARD)
		if Input.is_key_pressed(KEY_MINUS) or Input.is_key_pressed(KEY_KP_SUBTRACT):
			_zoom(ZOOM_STEP_KEYBOARD)
	rotation.y = lerp_angle(rotation.y, _yaw_target, smooth)
	_pitch.rotation.x = lerpf(_pitch.rotation.x, _pitch_target, smooth)
	dist = lerpf(dist, _dist_target, smooth)
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
			_zoom(-ZOOM_STEP_SCROLL)
		elif event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			_zoom(ZOOM_STEP_SCROLL)
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
			KEY_R:
				reset_to_safe_default()

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

func clear_transient_input() -> void:
	_orbiting = false
	_orbit_fallback = false
	_middle_button_down = false
	_orbit_source = "none"
	_yaw_target = rotation.y
	_pitch_target = _pitch.rotation.x
	_dist_target = dist

func orbit_step(direction: float) -> void:
	_yaw_target += direction * control_scale
	_orbit_source = "key"

func pitch_step(direction: float) -> void:
	_pitch_target = clampf(_pitch_target - direction * control_scale, PITCH_MIN, PITCH_MAX)

func pan_screen_delta(delta: Vector2) -> void:
	if locked:
		return
	var right := camera.global_transform.basis.x
	var forward := -camera.global_transform.basis.z
	right.y = 0.0
	forward.y = 0.0
	right = right.normalized()
	forward = forward.normalized()
	var scale := SCREEN_PAN_SCALE * control_scale
	var offset := (-right * delta.x + forward * delta.y) * scale
	pan_by(offset)

func target_position() -> Vector3:
	return position

func simulate_orbit_drag(delta: Vector2) -> void:
	_apply_orbit(delta)

func simulate_zoom_factor(factor: float) -> void:
	_dist_target = clampf(_dist_target * factor, DIST_MIN, DIST_MAX)

func _zoom(delta_step: float) -> void:
	_dist_target = clampf(_dist_target + delta_step, DIST_MIN, DIST_MAX)

func pan_by(offset: Vector3) -> void:
	if locked:
		return
	position += Vector3(offset.x, 0.0, offset.z)
	position.x = clampf(position.x, -60.0, 60.0)
	position.z = clampf(position.z, -60.0, 60.0)

func reset_to_safe_default() -> void:
	restore_state(_default_state)

func _apply_orbit(delta: Vector2) -> void:
	_yaw_target -= delta.x * ORBIT_SENS * control_scale
	_pitch_target = clampf(
		_pitch_target - delta.y * ORBIT_SENS * control_scale,
		PITCH_MIN, PITCH_MAX)

## Ray from the active camera through a screen position.
func screen_ray(screen_pos: Vector2) -> Array:
	return [camera.project_ray_origin(screen_pos), camera.project_ray_normal(screen_pos)]

func save_state() -> Dictionary:
	return {
		"pos": position, "yaw": _yaw_target,
		"pitch": _pitch.rotation.x, "dist": _dist_target,
	}

func restore_state(s: Dictionary) -> void:
	position = s.pos
	rotation.y = s.yaw
	_yaw_target = s.yaw
	_pitch.rotation.x = s.pitch
	_pitch_target = s.pitch
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
