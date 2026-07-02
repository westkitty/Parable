extends Node3D
## The divine hand: input state machine and the player's body.
## Control grammar (Candidate A, locked by approval):
##   LMB      — hand acts on world: grab hovered object, else grip-drag ground to pan
##   RMB      — orbit (camera_rig)
##   Scroll   — zoom (camera_rig)
##   Space    — held: gesture mode (grabbing disabled at state-machine level)
##   Esc      — safe release: gentle drop, abort gesture, never throws
## States: hover | pan | carry | gesture | gesture_draw

const PICK_RADIUS := 0.9            # forgiveness radius around the hand point
const CLICK_DRAG_THRESHOLD_PX := 6.0
const THROW_MIN_SPEED := 2.2        # below this, release = gentle drop
const CARRY_CAMERA_SCALE := 0.6
const HOVER_HEIGHT := 1.1
const PRESS_HEIGHT := 0.45
const GESTURE_PLANE_LIFT := 1.6
const RAY_LENGTH := 400.0

var enabled := true
var state := "hover"

var _rig: Node3D
var _island: Node
var _world: Node
var _visual: Node3D
var _trace: Node3D

var _ground_point := Vector3.ZERO
var _hovered: Node = null
var _held: Node = null
var _sampler := ThrowSampler.new()
var _time := 0.0

# Press bookkeeping
var _press_screen := Vector2.ZERO
var _press_kind := ""          # "" | "pan" | "carry" | "pending_click"
var _pending_click_target: Node = null
var _pan_anchor := Vector3.ZERO

# Gesture bookkeeping
var _gesture_mode := false
var _drawing := false
var _stroke_screen := PackedVector2Array()
var _stroke_world: Array[Vector3] = []
var _gesture_plane_y := 0.0
var _last_glyph := {"kind": "-", "rotation": 0.0, "closure": 1.0, "reversals": 0}
var _last_throw_raw := 0.0
var _last_throw_final := 0.0

func _ready() -> void:
	add_to_group("divine_hand")
	_visual = $HandVisual

func _physics_process(delta: float) -> void:
	if not enabled:
		return
	_time += delta
	_lazy_refs()
	if _rig == null or _island == null:
		return

	var mouse := get_viewport().get_mouse_position()

	if Input.is_action_just_pressed("cancel_action"):
		_cancel_everything()

	var want_gesture := Input.is_action_pressed("gesture_mode")
	if want_gesture and not _gesture_mode:
		_enter_gesture_mode()
	elif not want_gesture and _gesture_mode:
		_exit_gesture_mode()

	if _gesture_mode:
		_gesture_frame(mouse)
		return

	_world_frame(mouse, delta)

# --- Normal world interaction ----------------------------------------------

func _world_frame(mouse: Vector2, _delta: float) -> void:
	var ray: Array = _rig.screen_ray(mouse)
	var from: Vector3 = ray[0]
	var dir: Vector3 = ray[1]
	var space := get_world_3d().direct_space_state

	# Ground point under the mouse (terrain, layer 1).
	var ground := _ray_hit(space, from, dir, 1, false)
	if not ground.is_empty():
		_ground_point = ground.position
	else:
		# Off-island: intersect the sea plane so the hand never vanishes.
		if absf(dir.y) > 0.0001:
			var t := -from.y / dir.y
			if t > 0.0:
				_ground_point = from + dir * t

	# Hover: direct ray hit on a grabbable, else nearest grabbable near the
	# hand point (forgiveness radius).
	var new_hover: Node = null
	if _held == null and _press_kind == "":
		var hit := _ray_hit(space, from, dir, 2, false)
		if not hit.is_empty() and hit.collider.is_in_group("grabbable"):
			new_hover = hit.collider
		else:
			new_hover = _nearest_grabbable(_ground_point, PICK_RADIUS)
	_set_hovered(new_hover)

	# Presses.
	if Input.is_action_just_pressed("hand_press") and not _rig.is_orbiting():
		_press_screen = mouse
		if _hovered != null:
			_begin_carry(_hovered)
		else:
			var inter := _ray_hit(space, from, dir, 4, true)
			if not inter.is_empty():
				_press_kind = "pending_click"
				_pending_click_target = inter.collider
			else:
				_press_kind = "pan"
				_pan_anchor = _ground_point

	# Held-button behavior.
	if Input.is_action_pressed("hand_press"):
		match _press_kind:
			"pan":
				state = "pan"
				# Keep the grabbed ground point under the hand: intersect the
				# mouse ray with the anchor's height plane and pull the rig.
				if absf(dir.y) > 0.0001:
					var t2 := (_pan_anchor.y - from.y) / dir.y
					if t2 > 0.0:
						var now := from + dir * t2
						_rig.pan_by(_pan_anchor - now)
			"carry":
				state = "carry"
				_update_carry()
			"pending_click":
				pass
	elif Input.is_action_just_released("hand_press"):
		match _press_kind:
			"carry":
				_release_held()
			"pending_click":
				if mouse.distance_to(_press_screen) < CLICK_DRAG_THRESHOLD_PX \
						and _pending_click_target != null \
						and is_instance_valid(_pending_click_target) \
						and _pending_click_target.has_method("on_god_click"):
					_pending_click_target.on_god_click(_world)
				_pending_click_target = null
		_press_kind = ""
		if state != "carry":
			state = "hover"

	if _press_kind == "":
		state = "hover"

	# Hand placement + pose.
	var hand_h := HOVER_HEIGHT
	if _press_kind == "pan":
		hand_h = PRESS_HEIGHT
	elif _hovered != null and _held == null:
		hand_h = 0.75
	var target := _ground_point + Vector3(0.0, hand_h, 0.0)
	if _hovered != null and _held == null:
		target = _hovered.global_position + Vector3(0.0, 0.9, 0.0)
	global_position = global_position.lerp(target, 1.0 - exp(-14.0 * get_physics_process_delta_time()))
	rotation.y = _rig.rotation.y

	match state:
		"pan":
			_visual.set_pose("flat")
		"carry":
			_visual.set_pose("carry")
		_:
			_visual.set_pose("grip" if _hovered != null else "open")

	# Sample hand motion in rig-local space (camera motion contributes zero).
	var local_pos: Vector3 = _rig.global_transform.affine_inverse() * global_position
	_sampler.add_sample(local_pos, _time)

	# Carrying a villager toward a throw: legible pre-throw panic (visual-first).
	if _held != null and _held.is_in_group("villager"):
		_held.set_panic(_current_hand_speed() > THROW_MIN_SPEED)

func _begin_carry(obj: Node) -> void:
	_held = obj
	_set_hovered(null)
	_press_kind = "carry"
	_held.begin_hold()
	_rig.control_scale = CARRY_CAMERA_SCALE
	_sampler.clear()
	if not _held.is_in_group("villager"):
		var director := get_tree().get_first_node_in_group("witness_director")
		if director:
			director.announce("grab", _held.global_position, {"class": _held.display_name})

func _update_carry() -> void:
	if _held == null or not is_instance_valid(_held):
		_held = null
		_press_kind = ""
		return
	_held.set_hold_target(global_position + _held.hold_offset)

func _release_held(force_gentle := false) -> void:
	if _held == null or not is_instance_valid(_held):
		_held = null
		return
	var v_local := _sampler.velocity()
	var v_world: Vector3 = _rig.global_transform.basis * v_local
	if force_gentle:
		v_world = Vector3.ZERO
	_last_throw_raw = v_world.length()
	var obj := _held
	_held = null
	_rig.control_scale = 1.0

	# Offering placed gently near the shrine → awaken the glyph.
	var shrine := get_tree().get_first_node_in_group("shrine")
	if obj.display_name == "offering" and _last_throw_raw < THROW_MIN_SPEED \
			and shrine and shrine.within_offer_range(obj.global_position) \
			and not obj.consumed:
		shrine.receive_offering(obj)
		_last_throw_final = 0.0
		return

	obj.release(v_world, THROW_MIN_SPEED)
	_last_throw_final = obj.linear_velocity.length()

func _cancel_everything() -> void:
	# Esc never throws, never opens anything.
	if _held != null and is_instance_valid(_held):
		_release_held(true)
	_press_kind = ""
	_pending_click_target = null
	if _drawing:
		_drawing = false
		_stroke_screen.clear()
		_stroke_world.clear()
		if _trace:
			_trace.cancel()

# --- Gesture mode ------------------------------------------------------------

func _enter_gesture_mode() -> void:
	# Grabs are impossible in here by construction: carry ends gently first.
	if _held != null:
		_release_held(true)
	_press_kind = ""
	_gesture_mode = true
	state = "gesture"
	_gesture_plane_y = _ground_point.y + GESTURE_PLANE_LIFT
	_rig.locked = true
	_visual.set_pose("point")

func _exit_gesture_mode() -> void:
	if _drawing:
		_finish_stroke()
	_gesture_mode = false
	state = "hover"
	_rig.locked = false
	_visual.set_pose("open")

func _gesture_frame(mouse: Vector2) -> void:
	var ray: Array = _rig.screen_ray(mouse)
	var from: Vector3 = ray[0]
	var dir: Vector3 = ray[1]
	# Hand rides a fixed sacred draw plane; the world holds still beneath it.
	if absf(dir.y) > 0.0001:
		var t := (_gesture_plane_y - from.y) / dir.y
		if t > 0.0:
			var p := from + dir * t
			global_position = global_position.lerp(p, 0.5)

	if Input.is_action_just_pressed("hand_press"):
		_drawing = true
		state = "gesture_draw"
		_stroke_screen = PackedVector2Array()
		_stroke_world.clear()
		if _trace:
			_trace.begin()
	if _drawing:
		if _stroke_screen.is_empty() or mouse.distance_to(_stroke_screen[-1]) > 3.0:
			_stroke_screen.append(mouse)
			_stroke_world.append(global_position)
			if _trace:
				_trace.add_point(global_position)
	if Input.is_action_just_released("hand_press") and _drawing:
		_finish_stroke()

func _finish_stroke() -> void:
	_drawing = false
	state = "gesture"
	var result := GestureRecognizer.classify(_stroke_screen)
	_last_glyph = result
	var centroid := Vector3.ZERO
	for p in _stroke_world:
		centroid += p
	if not _stroke_world.is_empty():
		centroid /= float(_stroke_world.size())
	var target: Vector3 = _island.ground_point(centroid.x, centroid.z)
	var ok: bool = _world.cast_glyph(result.kind, target) if _world else false
	if _trace:
		if ok:
			_trace.end_success()
		else:
			_trace.end_fail()
	_stroke_screen = PackedVector2Array()
	_stroke_world.clear()

# --- Queries -----------------------------------------------------------------

func is_carrying() -> bool:
	return _held != null

func get_debug() -> Dictionary:
	return {
		"state": state,
		"hovered": _hovered.display_name if (_hovered != null and is_instance_valid(_hovered)) else "-",
		"held": _held.display_name if (_held != null and is_instance_valid(_held)) else "-",
		"held_mass": ["light", "medium", "heavy"][_held.mass_category] if (_held != null and is_instance_valid(_held)) else "-",
		"hand_speed": _current_hand_speed(),
		"last_throw_raw": _last_throw_raw,
		"last_throw_final": _last_throw_final,
		"gesture_mode": _gesture_mode,
		"glyph_kind": _last_glyph.get("kind", "-"),
		"glyph_rotation": _last_glyph.get("rotation", 0.0),
		"glyph_closure": _last_glyph.get("closure", 0.0),
		"glyph_reversals": _last_glyph.get("reversals", 0),
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

func _current_hand_speed() -> float:
	return _sampler.velocity().length()

func _ray_hit(space: PhysicsDirectSpaceState3D, from: Vector3, dir: Vector3,
		mask: int, areas: bool) -> Dictionary:
	var params := PhysicsRayQueryParameters3D.create(from, from + dir * RAY_LENGTH)
	params.collision_mask = mask
	params.collide_with_areas = areas
	params.collide_with_bodies = not areas
	return space.intersect_ray(params)

func _nearest_grabbable(point: Vector3, radius: float) -> Node:
	var best: Node = null
	var best_d := radius
	for g in get_tree().get_nodes_in_group("grabbable"):
		if g == _held:
			continue
		var d: float = g.global_position.distance_to(point)
		if d < best_d:
			best_d = d
			best = g
	return best

func _set_hovered(obj: Node) -> void:
	if obj == _hovered:
		return
	if _hovered != null and is_instance_valid(_hovered):
		_hovered.set_hover(false)
	_hovered = obj
	if _hovered != null:
		_hovered.set_hover(true)
