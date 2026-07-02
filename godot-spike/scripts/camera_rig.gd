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
const ZOOM_PULL := 0.18

var camera: Camera3D
var locked := false            # true during gesture drawing + temple transitions
var control_scale := 1.0       # reduced while carrying
var dist := 26.0

var _pitch: Node3D
var _dist_target := 26.0
var _orbiting := false
var _orbit_fallback := false

func _ready() -> void:
	add_to_group("camera_rig")
	_pitch = $Pitch
	camera = $Pitch/Camera3D
	position = Vector3(0.0, 6.0, 3.5)
	_pitch.rotation.x = deg_to_rad(-56.0)
	camera.position = Vector3(0.0, 0.0, dist)
	camera.far = 300.0
	_dist_target = dist

func _process(delta: float) -> void:
	dist = lerpf(dist, _dist_target, 1.0 - exp(-10.0 * delta))
	camera.position = Vector3(0.0, 0.0, dist)

func _unhandled_input(event: InputEvent) -> void:
	if locked:
		return
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_MIDDLE:
			_orbiting = event.pressed
		elif event.button_index == MOUSE_BUTTON_LEFT and event.alt_pressed:
			_orbit_fallback = event.pressed
		elif event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_UP:
			_zoom(1.0 / ZOOM_FACTOR)
		elif event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			_zoom(ZOOM_FACTOR)
	elif event is InputEventMouseMotion and is_orbiting():
		rotation.y -= event.relative.x * ORBIT_SENS * control_scale
		_pitch.rotation.x = clampf(
			_pitch.rotation.x - event.relative.y * ORBIT_SENS * control_scale,
			PITCH_MIN, PITCH_MAX)

func is_orbiting() -> bool:
	return (_orbiting or _orbit_fallback) and not locked

func orbit_modifier_active() -> bool:
	return _orbit_fallback and not locked

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
