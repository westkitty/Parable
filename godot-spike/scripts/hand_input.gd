extends Node3D
## The divine hand: input state machine and the player's body.
## Control grammar (Andrew patch):
##   RMB      — grab / carry / release
##   LMB      — click interact, or grip-drag ground to pan
##   MMB      — orbit
##   Scroll   — zoom
##   Spiral   — arms miracle mode without holding any button
##   Space    — optional debug fallback to keep miracle tracing alive
##   Esc      — safe release: gentle drop, abort miracle, never throws
## States: hover | pan | carry | miracle

const PICK_RADIUS := 0.9            # screen-space forgiveness now owns pickup
const CLICK_DRAG_THRESHOLD_PX := 10.0
const THROW_MIN_SPEED := 1.8        # below this, release = gentle drop
const THROW_VERTICAL_LIFT := 2.35   # modest extra loft, validated by Andrew later
const CARRY_CAMERA_SCALE := 1.0
const HOVER_HEIGHT := 0.82
const PRESS_HEIGHT := 0.28
const RAY_LENGTH := 400.0
const MIRACLE_POINT_STEP_PX := 6.0
const MIRACLE_IDLE_RESET := 0.95
const MIRACLE_GLYPH_TIMEOUT := 6.0
const MIRACLE_ARM_WINDOW := 3.2
const MIRACLE_ARMED_DURATION := 6.2
const DEBUG_SPACE_ARM_DURATION := 10.0
const HAND_TRACKING_FEEDBACK_LENGTH := 26.0
const HAND_DIRECT_CARRY_HEIGHT := 0.06
const HOVER_GRIP_LIFT := Vector3(0.0, 0.38, 0.0)
const MAX_STROKE_POINTS := 48

var enabled := true
var state := "hover"

var _rig: Node3D
var _island: Node
var _world: Node
var _visual: Node3D
var _trace: Node3D
var _diagnostics: CanvasLayer
var _shrine: Node
var _grabbables: Array[Node] = []

var _ground_point := Vector3.ZERO
var _hand_target := Vector3.ZERO
var _hovered: Node = null
var _held: Node = null
var _input_suspended := false
var _sampler := ThrowSampler.new()
var _time := 0.0

# Press bookkeeping
var _press_screen := Vector2.ZERO
var _press_kind := ""          # "" | "pan" | "carry" | "pending_click" | "pending_pan"
var _pending_click_target: Node = null
var _pan_last_ground := Vector3.ZERO
var _pan_last_mouse := Vector2.ZERO
var _pan_using_ground := false
var _pan_source := "none"

# Miracle bookkeeping
var _miracle_armed := false
var _miracle_override := false
var _stroke_screen := PackedVector2Array()
var _stroke_world: Array[Vector3] = []
var _stroke_length := 0.0
var _stroke_started_at := 0.0
var _stroke_last_move_at := 0.0
var _last_glyph := {"kind": "-", "rotation": 0.0, "closure": 1.0, "reversals": 0, "radius_swing": 0.0}
var _last_throw_raw := 0.0
var _last_throw_final := 0.0
var _last_release_mode := "-"
var _last_release_speed := 0.0
var _last_throw_vector := Vector3.ZERO
var _last_cast_result := "-"
var _armed_until := 0.0
var _miracle_debug_loops := 0.0
var _last_arm_source := "-"

func _ready() -> void:
	add_to_group("divine_hand")
	_visual = $HandVisual

func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo and _diagnostics_visible():
		match event.keycode:
			KEY_SPACE:
				_force_arm_for_debug()
			KEY_C:
				_debug_cast_blessing()
			KEY_H:
				_debug_awaken_shrine()
			KEY_B:
				_debug_learn_bolt()
			KEY_Z:
				_debug_cast_bolt()

func _physics_process(delta: float) -> void:
	if not enabled:
		return
	_time += delta
	_lazy_refs()
	if _rig == null or _island == null:
		return
	if _input_suspended:
		return

	var mouse := get_viewport().get_mouse_position()

	if Input.is_action_just_pressed("cancel_action"):
		_cancel_everything()

	_miracle_override = Input.is_action_pressed("gesture_mode")

	_world_frame(mouse, delta)

# --- Normal world interaction ----------------------------------------------

func _world_frame(mouse: Vector2, _delta: float) -> void:
	var ray: Array = _rig.screen_ray(mouse)
	var from: Vector3 = ray[0]
	var dir: Vector3 = ray[1]
	var space := get_world_3d().direct_space_state

	# Ground point under the mouse (terrain, layer 1).
	var ground_valid := _update_ground_point(from, dir)

	# Hover follows the visible palm/grip point rather than the raw cursor.
	var new_hover: Node = null
	if _held == null and _press_kind == "":
		new_hover = _screen_pick_grabbable(mouse)
	_set_hovered(new_hover)

	# Presses.
	if Input.is_action_just_pressed("grab_action") and not _rig.is_orbiting():
		if _miracle_armed:
			_cancel_miracle(false)
		_press_kind = ""
		_pending_click_target = null
		_pan_source = "none"
		_press_screen = mouse
		if _hovered != null:
			_begin_carry(_hovered)

	# Carry follows the hand until the explicit release path ends it.
	if _press_kind == "carry":
		state = "carry"
		_update_carry()
	if Input.is_action_just_released("grab_action"):
		if _press_kind == "carry":
			_release_held()
		_press_kind = ""
		if state != "carry":
			state = "hover"

	if Input.is_action_just_pressed("pan_action") and not _rig.is_orbiting() and not _rig.orbit_modifier_active() and _held == null:
		_press_screen = mouse
		_pan_last_mouse = mouse
		var inter := _ray_hit(space, from, dir, 4, true)
		if not inter.is_empty():
			_press_kind = "pending_click"
			_pending_click_target = inter.collider
		elif _hovered == null:
			_press_kind = "pending_pan"
			_pan_using_ground = ground_valid
			_pan_last_ground = _ground_point
			_pan_source = "none"
			_cancel_miracle(false)

	if Input.is_action_pressed("pan_action"):
		match _press_kind:
			"pending_pan":
				if mouse.distance_to(_press_screen) >= CLICK_DRAG_THRESHOLD_PX:
					_press_kind = "pan"
					_pan_last_mouse = mouse
					_pan_last_ground = _ground_point
					_pan_source = "ground" if (ground_valid and _pan_using_ground) else "screen"
			"pan":
				state = "pan"
				if ground_valid and _pan_using_ground:
					_rig.pan_by(_pan_last_ground - _ground_point)
					_pan_last_ground = _ground_point
					_pan_source = "ground"
				else:
					_pan_using_ground = false
					_rig.pan_screen_delta(mouse - _pan_last_mouse)
					_pan_source = "screen"
				_pan_last_mouse = mouse
			"pending_click":
				pass
	elif Input.is_action_just_released("pan_action"):
		match _press_kind:
			"pending_click":
				if mouse.distance_to(_press_screen) < CLICK_DRAG_THRESHOLD_PX \
						and _pending_click_target != null \
						and is_instance_valid(_pending_click_target) \
						and _pending_click_target.has_method("on_god_click"):
					_pending_click_target.on_god_click(_world)
				_pending_click_target = null
			"pending_pan":
				pass
		_press_kind = ""
		_pan_source = "none"
		if state != "carry":
			state = "hover"

	if _press_kind == "":
		state = "hover"

	# Hand placement + pose.
	var hand_h := HOVER_HEIGHT
	if _press_kind == "pan":
		hand_h = PRESS_HEIGHT
	var target := _ground_point + Vector3(0.0, hand_h, 0.0)
	if _held != null:
		target = _origin_for_hover_anchor(_ground_point + Vector3(0.0, _carry_anchor_height(), 0.0))
	_hand_target = target
	global_position = target
	rotation.y = _rig.rotation.y

	match state:
		"pan":
			_visual.set_pose("flat")
		"carry":
			_visual.set_pose("carry")
		"miracle":
			_visual.set_pose("point")
		_:
			_visual.set_pose("grip" if _hovered != null else "open")

	# Sample hand motion in rig-local space (camera motion contributes zero).
	var local_pos: Vector3 = _rig.global_transform.affine_inverse() * _hand_target
	_sampler.add_sample(local_pos, _time)

	# Carrying a villager toward a throw: legible pre-throw panic (visual-first).
	if _held != null and _held.is_in_group("villager"):
		_held.set_panic(_current_hand_speed() > THROW_MIN_SPEED)

	_update_miracle_tracking(mouse)

func _begin_carry(obj: Node) -> void:
	_held = obj
	_set_hovered(null)
	_press_kind = "carry"
	_held.begin_hold()
	_rig.control_scale = CARRY_CAMERA_SCALE
	_sampler.clear()
	if _visual and _visual.has_method("set_hold_profile"):
		_visual.set_hold_profile(_held.hold_profile)
	if _visual and _visual.has_method("set_pose"):
		_visual.set_pose("carry")
	_update_carry()
	if not _held.is_in_group("villager"):
		var director := get_tree().get_first_node_in_group("witness_director")
		if director:
			director.announce("grab", _held.global_position, {"class": _held.display_name})

func _update_carry() -> void:
	if _held == null or not is_instance_valid(_held):
		_held = null
		_press_kind = ""
		return
	var target: Vector3 = _visual.grip_socket_world(_held.hold_offset) if _visual and _visual.has_method("grip_socket_world") else global_position + _held.hold_offset
	var floor_y: float = _island.height_at(target.x, target.z) + _held.ground_clearance
	target.y = maxf(target.y, floor_y)
	_held.set_hold_target(target)

func _release_held(force_gentle := false) -> void:
	if _held == null or not is_instance_valid(_held):
		_held = null
		return
	var v_local := _sampler.velocity()
	var avg_world: Vector3 = _rig.global_transform.basis * v_local
	var peak_world: Vector3 = _rig.global_transform.basis * avg_world.normalized() * _sampler.peak_speed() if avg_world.length() > 0.001 else _rig.global_transform.basis.z * -_sampler.peak_speed()
	var v_world: Vector3 = avg_world
	if force_gentle:
		v_world = Vector3.ZERO
	else:
		peak_world = (_rig.global_transform.basis * v_local.normalized()) * _sampler.peak_speed() if v_local.length() > 0.001 else Vector3.ZERO
		var use_peak := peak_world.length() >= THROW_MIN_SPEED and peak_world.length() > avg_world.length() * 0.82
		if use_peak:
			v_world = peak_world
		if v_world.length() >= THROW_MIN_SPEED:
			v_world.y = maxf(v_world.y + THROW_VERTICAL_LIFT, THROW_VERTICAL_LIFT * 0.7)
	_last_throw_vector = v_world
	_last_throw_raw = v_world.length()
	var obj := _held
	_held = null
	_rig.control_scale = 1.0
	if _visual and _visual.has_method("set_hold_profile"):
		_visual.set_hold_profile("")
	obj.clamp_above_ground(_island)

	obj.release(v_world, THROW_MIN_SPEED)
	_last_throw_final = obj.linear_velocity.length()
	_last_release_mode = obj.last_release_mode
	_last_release_speed = obj.last_release_speed

func _cancel_everything() -> void:
	# Esc never throws, never opens anything.
	if _held != null and is_instance_valid(_held):
		_release_held(true)
	_press_kind = ""
	_pending_click_target = null
	_cancel_miracle(true)

func clear_transient_input_for_focus() -> void:
	_input_suspended = true
	if _held != null and is_instance_valid(_held):
		_release_held(true)
	_press_kind = ""
	_pending_click_target = null
	_pan_source = "none"
	_pan_using_ground = false
	_sampler.clear()
	_set_hovered(null)
	_cancel_miracle(false)
	state = "hover"

func resync_after_focus() -> void:
	_lazy_refs()
	if _rig == null:
		return
	_input_suspended = false
	var mouse := get_viewport().get_mouse_position()
	var ray: Array = _rig.screen_ray(mouse)
	_update_ground_point(ray[0], ray[1])
	_press_screen = mouse
	_pan_last_mouse = mouse
	_hand_target = _ground_point + Vector3(0.0, HOVER_HEIGHT, 0.0)
	global_position = _hand_target
	if _held == null and _press_kind == "":
		_set_hovered(_screen_pick_grabbable(mouse))

func _update_miracle_tracking(mouse: Vector2) -> void:
	if _rig == null or _island == null:
		return
	var blockers: bool = _held != null or _press_kind == "carry" or _press_kind == "pan" or _rig.is_orbiting()
	if blockers:
		if _visual:
			_visual.set_tracking_feedback(false)
		_cancel_miracle(false)
		return
	var intentional_motion := _stroke_screen.is_empty() or mouse.distance_to(_stroke_screen[-1]) >= MIRACLE_POINT_STEP_PX
	if intentional_motion:
		if _stroke_screen.is_empty():
			_stroke_started_at = _time
			_stroke_length = 0.0
			if _trace:
				_trace.begin()
		else:
			_stroke_length += mouse.distance_to(_stroke_screen[-1])
		_push_stroke_point(mouse, global_position)
		_stroke_last_move_at = _time
		if _trace:
			_trace.add_point(global_position)
	if _visual:
		_visual.set_tracking_feedback(_stroke_length >= HAND_TRACKING_FEEDBACK_LENGTH or _miracle_armed)
	if _stroke_screen.is_empty():
		return
	if not _miracle_armed:
		var spiral := GestureRecognizer.detect_spiral(_stroke_screen)
		if spiral.kind == "spiral" or (_miracle_override and _stroke_length >= 48.0):
			_arm_miracle(spiral)
			return
		if (_time - _stroke_started_at > MIRACLE_ARM_WINDOW or _time - _stroke_last_move_at > MIRACLE_IDLE_RESET) and not _miracle_override:
			_cancel_miracle(false)
		return
	if _time > _armed_until:
		_cancel_miracle(false)
		return
	if _stroke_screen.is_empty():
		return
	if _time - _stroke_started_at > MIRACLE_GLYPH_TIMEOUT:
		_finish_stroke()
		return
	if _time - _stroke_last_move_at > MIRACLE_IDLE_RESET and _stroke_screen.size() >= GestureRecognizer.MIN_POINTS:
		_finish_stroke()

func _arm_miracle(spiral: Dictionary, source := "SPIRAL") -> void:
	_miracle_armed = true
	state = "miracle"
	_armed_until = _time + MIRACLE_ARMED_DURATION
	_last_arm_source = source
	_miracle_debug_loops = spiral.get("loop_estimate", 0.0)
	_last_glyph = {
		"kind": "spiral",
		"rotation": spiral.get("rotation", 0.0),
		"closure": 0.0,
		"reversals": 0,
		"radius_swing": spiral.get("radius_swing", 0.0),
	}
	_stroke_screen = PackedVector2Array()
	_stroke_world.clear()
	_stroke_length = 0.0
	_stroke_started_at = _time
	_stroke_last_move_at = _time
	if _trace:
		_trace.begin()
		_trace.set_armed_feedback()
		_trace.add_point(global_position)
		_trace.add_point(global_position + Vector3(0.0, 0.15, 0.0))
	if _visual:
		_visual.set_tracking_feedback(false)
		_visual.set_miracle_armed(true)
		if _visual.has_method("pulse_debug_arm"):
			_visual.pulse_debug_arm()
	_last_cast_result = "debug_arm" if source == "DEBUG_SPACE" else "spiral_arm"

func _force_arm_for_debug() -> void:
	if _miracle_armed:
		_armed_until = maxf(_armed_until, _time + DEBUG_SPACE_ARM_DURATION)
		_last_arm_source = "DEBUG_SPACE"
		return
	_arm_miracle({
		"rotation": -TAU,
		"radius_swing": 0.2,
		"loop_estimate": 1.0,
	}, "DEBUG_SPACE")
	_armed_until = maxf(_armed_until, _time + DEBUG_SPACE_ARM_DURATION)

func _finish_stroke() -> void:
	var result := GestureRecognizer.classify(_stroke_screen)
	_last_glyph = result
	var centroid := Vector3.ZERO
	for p in _stroke_world:
		centroid += p
	if not _stroke_world.is_empty():
		centroid /= float(_stroke_world.size())
	var target: Vector3 = _island.ground_point(centroid.x, centroid.z)
	var ok: bool = _world.cast_glyph(result.kind, target) if _world else false
	_last_cast_result = "cast_" + result.kind if ok else ("reject_" + result.kind)
	if _trace:
		if ok:
			_trace.end_success()
		else:
			_trace.end_fail()
	_cancel_miracle(false)

func _cancel_miracle(with_fail_fx: bool) -> void:
	if with_fail_fx and _trace and (_miracle_armed or not _stroke_screen.is_empty()):
		_trace.end_fail()
	elif not with_fail_fx and _trace and not _stroke_screen.is_empty() and not _miracle_armed:
		_trace.clear_now()
	_miracle_armed = false
	_armed_until = 0.0
	_miracle_debug_loops = 0.0
	_last_arm_source = "-"
	if _visual:
		_visual.set_tracking_feedback(false)
		_visual.set_miracle_armed(false)
	if state == "miracle":
		state = "hover"
	_stroke_screen = PackedVector2Array()
	_stroke_world.clear()
	_stroke_length = 0.0
	_stroke_started_at = 0.0
	_stroke_last_move_at = 0.0

# --- Queries -----------------------------------------------------------------

func is_carrying() -> bool:
	return _held != null

func held_object_name() -> String:
	return _held.display_name if (_held != null and is_instance_valid(_held)) else "-"

func debug_is_right_mouse_down() -> bool:
	return Input.is_action_pressed("grab_action")

func simulate_grab(obj: Node) -> bool:
	if obj == null:
		return false
	_begin_carry(obj)
	return _held == obj

func simulate_right_mouse_press_for_test() -> bool:
	if _hovered == null or not is_instance_valid(_hovered):
		return false
	_begin_carry(_hovered)
	return true

func clear_hover_for_test() -> void:
	_set_hovered(null)

func force_hover_for_test(obj: Node) -> void:
	_set_hovered(obj)

func simulate_release_for_test(world_velocity: Vector3, force_gentle := false) -> void:
	if _held == null:
		return
	_update_carry()
	_sampler.clear()
	_sampler.add_sample(Vector3.ZERO, 0.0)
	_sampler.add_sample(_rig.global_transform.basis.inverse() * world_velocity * 0.1, 0.1)
	_release_held(force_gentle)

func simulate_cancel_for_test() -> void:
	_cancel_everything()

func simulate_arm_for_test() -> void:
	_force_arm_for_debug()

func simulate_glyph_for_test(kind: String, target: Vector3) -> bool:
	_miracle_armed = true
	_armed_until = _time + MIRACLE_ARMED_DURATION
	return _world.cast_glyph(kind, target) if _world else false

func simulate_debug_blessing_for_test() -> bool:
	_force_arm_for_debug()
	var target: Vector3 = _island.ground_point(_hand_target.x, _hand_target.z)
	return _world.cast_glyph("circle", target) if _world else false

func simulate_debug_awaken_shrine_for_test() -> bool:
	if _shrine and _shrine.has_method("debug_awaken"):
		_shrine.debug_awaken()
		return _shrine.is_awakened()
	return false

func simulate_debug_learn_bolt_for_test() -> bool:
	_debug_learn_bolt()
	return _world != null and _world.identity != null and _world.identity.learned_bolt

func simulate_debug_bolt_for_test() -> bool:
	_force_arm_for_debug()
	_debug_learn_bolt()
	var target: Vector3 = _island.ground_point(_hand_target.x, _hand_target.z)
	return _world.cast_glyph("zigzag", target) if _world else false

func throw_min_speed_for_test() -> float:
	return THROW_MIN_SPEED

func armed_timer_remaining() -> float:
	return maxf(_armed_until - _time, 0.0)

func get_debug() -> Dictionary:
	return {
		"state": state,
		"input_mode": _press_kind if _press_kind != "" else state,
		"hovered": _hovered.display_name if (_hovered != null and is_instance_valid(_hovered)) else "-",
		"held": _held.display_name if (_held != null and is_instance_valid(_held)) else "-",
		"held_mass": ["light", "medium", "heavy"][_held.mass_category] if (_held != null and is_instance_valid(_held)) else "-",
		"right_mouse_down": debug_is_right_mouse_down(),
		"hand_speed": _current_hand_speed(),
		"last_throw_raw": _last_throw_raw,
		"last_throw_final": _last_throw_final,
		"last_throw_vector": _last_throw_vector,
		"last_release_mode": _last_release_mode,
		"last_release_speed": _last_release_speed,
		"gesture_mode": _miracle_armed or _miracle_override,
		"debug_force_arm": _last_arm_source == "DEBUG_SPACE",
		"trace_length": _stroke_length,
		"trace_armed": _miracle_armed,
		"armed_timer": armed_timer_remaining(),
		"last_arm_source": _last_arm_source,
		"cast_result": _last_cast_result,
		"glyph_kind": _last_glyph.get("kind", "-"),
		"glyph_rotation": _last_glyph.get("rotation", 0.0),
		"glyph_closure": _last_glyph.get("closure", 0.0),
		"glyph_reversals": _last_glyph.get("reversals", 0),
		"glyph_radius_swing": _last_glyph.get("radius_swing", 0.0),
		"glyph_loops": _miracle_debug_loops,
		"pan_active": _press_kind == "pan",
		"pan_source": _pan_source,
		"camera_target": _rig.target_position() if (_rig and _rig.has_method("target_position")) else Vector3.ZERO,
		"bolt_learned": _world.identity.learned_bolt if (_world and _world.identity) else false,
		"ray_target": _ground_point,
		"hand_target": _hand_target,
		"grip_point": _visual.grip_socket_world() if (_visual and _visual.has_method("grip_socket_world")) else global_position,
		"held_position": _held.global_position if (_held != null and is_instance_valid(_held)) else Vector3.ZERO,
		"hold_offset": _held.hold_offset if (_held != null and is_instance_valid(_held)) else Vector3.ZERO,
		"hold_distance": _held.global_position.distance_to(_visual.grip_socket_world(_held.hold_offset)) if (_held != null and is_instance_valid(_held) and _visual and _visual.has_method("grip_socket_world")) else 0.0,
		"hold_profile": _visual.active_hold_profile() if (_visual and _visual.has_method("active_hold_profile")) else "-",
		"hand_pose": _visual.pose_name() if (_visual and _visual.has_method("pose_name")) else "-",
		"hover_anchor": _hovered.pick_anchor_point() if (_hovered != null and is_instance_valid(_hovered) and _hovered.has_method("pick_anchor_point")) else Vector3.ZERO,
	}

# --- Internals ---------------------------------------------------------------

func _lazy_refs() -> void:
	if _rig == null:
		_rig = get_tree().get_first_node_in_group("camera_rig")
	if _island == null:
		_island = get_tree().get_first_node_in_group("island")
	if _world == null:
		_world = get_tree().get_first_node_in_group("world")
	if _trace == null:
		_trace = get_tree().get_first_node_in_group("gesture_trace")
	if _diagnostics == null:
		_diagnostics = get_tree().get_first_node_in_group("diagnostics")
	if _shrine == null:
		_shrine = get_tree().get_first_node_in_group("shrine")
	if _grabbables.is_empty():
		_refresh_grabbables()

func _current_hand_speed() -> float:
	return _sampler.velocity().length()

func _ray_hit(space: PhysicsDirectSpaceState3D, from: Vector3, dir: Vector3,
		mask: int, areas: bool) -> Dictionary:
	var params := PhysicsRayQueryParameters3D.create(from, from + dir * RAY_LENGTH)
	params.collision_mask = mask
	params.collide_with_areas = areas
	params.collide_with_bodies = not areas
	return space.intersect_ray(params)

func _update_ground_point(from: Vector3, dir: Vector3) -> bool:
	var space := get_world_3d().direct_space_state
	var ground := _ray_hit(space, from, dir, 1, false)
	if not ground.is_empty():
		_ground_point = ground.position
		return true
	if absf(dir.y) > 0.0001:
		var t := -from.y / dir.y
		if t > 0.0:
			_ground_point = from + dir * t
	return false

func _refresh_grabbables() -> void:
	_grabbables.clear()
	for g in get_tree().get_nodes_in_group("grabbable"):
		_grabbables.append(g)

func _screen_pick_grabbable(mouse: Vector2) -> Node:
	if _rig == null or _rig.camera == null:
		return null
	var best: Node = null
	var best_score := INF
	var grip_screen: Vector2 = mouse
	if _visual and _visual.has_method("grip_socket_world"):
		grip_screen = _rig.camera.unproject_position(_visual.grip_socket_world())
	for g in _grabbables:
		if g == null or not is_instance_valid(g) or not g.is_in_group("grabbable"):
			continue
		if g == _held:
			continue
		if "consumed" in g and g.consumed:
			continue
		var anchor: Vector3 = g.pick_anchor_point()
		var screen_pos: Vector2 = _rig.camera.unproject_position(anchor)
		var d := grip_screen.distance_to(screen_pos)
		if d > g.hover_screen_radius:
			continue
		var score := d / maxf(g.hover_screen_radius, 1.0)
		if score < best_score:
			best_score = score
			best = g
	return best

func _origin_for_hover_anchor(anchor: Vector3) -> Vector3:
	if _visual and _visual.has_method("origin_for_grip_world"):
		return _visual.origin_for_grip_world(anchor + HOVER_GRIP_LIFT)
	return anchor + HOVER_GRIP_LIFT

func _carry_anchor_height() -> float:
	if _held == null or not is_instance_valid(_held):
		return HAND_DIRECT_CARRY_HEIGHT
	var needed: float = _held.ground_clearance - HOVER_GRIP_LIFT.y - _held.hold_offset.y
	return maxf(HAND_DIRECT_CARRY_HEIGHT, needed)

func _push_stroke_point(screen_point: Vector2, world_point: Vector3) -> void:
	_stroke_screen.append(screen_point)
	_stroke_world.append(world_point)
	while _stroke_screen.size() > MAX_STROKE_POINTS:
		_stroke_screen.remove_at(0)
		_stroke_world.remove_at(0)

func _set_hovered(obj: Node) -> void:
	if obj == _hovered:
		return
	if _hovered != null and is_instance_valid(_hovered):
		_hovered.set_hover(false)
	_hovered = obj
	if _hovered != null:
		_hovered.set_hover(true)

func _diagnostics_visible() -> bool:
	return _diagnostics != null and _diagnostics.visible

func _debug_cast_blessing() -> void:
	if not _miracle_armed or _world == null:
		return
	var target: Vector3 = _island.ground_point(_hand_target.x, _hand_target.z)
	var ok: bool = _world.cast_glyph("circle", target)
	_last_cast_result = "debug_blessing" if ok else "reject_debug_blessing"
	if ok:
		_cancel_miracle(false)

func _debug_awaken_shrine() -> void:
	if _shrine and _shrine.has_method("debug_awaken"):
		_shrine.debug_awaken()

func _debug_learn_bolt() -> void:
	if _world and _world.identity:
		_world.identity.learn_bolt()

func _debug_cast_bolt() -> void:
	if not _miracle_armed or _world == null or _world.identity == null or not _world.identity.learned_bolt:
		return
	var target: Vector3 = _island.ground_point(_hand_target.x, _hand_target.z)
	var ok: bool = _world.cast_glyph("zigzag", target)
	_last_cast_result = "debug_bolt" if ok else "reject_debug_bolt"
	if ok:
		_cancel_miracle(false)
