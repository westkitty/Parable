extends SceneTree
## M1 rendered QA tour.
##
## Headless surrogates prove state transitions. They cannot see a picture, and
## every defect this milestone repairs is a picture defect. This tour drives the
## real hand update seam in a rendered window and saves PNGs of each state so the
## frames can actually be looked at before Andrew is asked to play.
##
## Run (never headless — it needs a renderer):
##   PARABLE_QA_DIR=/abs/output/dir godot --path . --script res://tests/qa_tour_m1.gd
##
## Output is written to PARABLE_QA_DIR (default user://) and is deliberately not
## a project asset.

const SETTLE_FRAMES := 6
const REACH_FRAMES := 22
const HOLD_FRAMES := 20
const STEP := 1.0 / 60.0

var _dir := ""
var _hand: Node
var _rig: Node
var _shots := 0

func _initialize() -> void:
	_run.call_deferred()

func _run() -> void:
	_dir = OS.get_environment("PARABLE_QA_DIR")
	if _dir == "":
		_dir = "user://"
	print("== M1 rendered QA tour -> %s ==" % _dir)
	root.set_size(Vector2i(1440, 900))
	var identity: Node = load("res://scripts/god_identity.gd").new()
	identity.name = "GodIdentity"
	root.add_child(identity)
	var main: Node = load("res://scenes/Main.tscn").instantiate()
	root.add_child(main)
	await process_frame
	await process_frame
	for _i in 18:
		await physics_frame

	_hand = main.get_node("DivineHand")
	_rig = main.get_node("CameraRig")
	# Drive the seam directly: a windowed run would otherwise track the real OS
	# cursor and fight every scripted pose.
	_hand.enabled = false
	_hand._refresh_grabbables()

	await _capture_default_framing()
	await _capture_reach_sequence()
	await _capture_pan_from_rock()
	for kind in ["rock", "villager", "offering", "tree"]:
		await _capture_held(kind)

	print("== M1 rendered QA tour complete: %d frames ==" % _shots)
	quit(0)

# --- Tour steps --------------------------------------------------------------

func _capture_default_framing() -> void:
	_rig.reset_to_safe_default()
	await _settle(SETTLE_FRAMES)
	var empty := _empty_screen_point()
	await _drive(empty, REACH_FRAMES)
	await _shot("01_hand_over_empty_terrain_default_camera")

func _capture_reach_sequence() -> void:
	var rock := _grabbable("rock")
	if rock == null:
		return
	_frame_on(rock)
	await _settle(SETTLE_FRAMES)
	# Start away from the rock so the reach is a visible travel, not a snap.
	var away := _empty_screen_point()
	await _drive(away, REACH_FRAMES)
	await _shot("02_hand_before_reach")
	var scr := _screen_of(rock)
	await _drive(scr, 3)
	await _shot("03_hand_mid_reach_toward_rock")
	await _drive(scr, REACH_FRAMES)
	await _shot("04_hand_settled_contact_on_rock")
	# Real RMB acquisition, same path the player uses.
	_press(MOUSE_BUTTON_RIGHT, true, scr)
	await physics_frame
	await _drive(scr, HOLD_FRAMES)
	await _shot("05_rock_acquired_and_held")
	_press(MOUSE_BUTTON_RIGHT, false, scr)
	await physics_frame
	await _drive(scr, 4)
	_hand.simulate_release_for_test(Vector3.ZERO, true)
	await _settle(4)

func _capture_pan_from_rock() -> void:
	var rock := _grabbable("rock")
	if rock == null:
		return
	_rig.reset_to_safe_default()
	await _settle(SETTLE_FRAMES)
	var scr := _screen_of(rock)
	await _drive(scr, 8)
	await _shot("06_before_pan_press_on_top_of_rock")
	_press(MOUSE_BUTTON_LEFT, true, scr)
	await physics_frame
	await _drive(scr, 2)
	# Drag well past the threshold, in steps, so the camera travel is real.
	for i in range(1, 13):
		await _drive(scr + Vector2(-26.0 * i, 16.0 * i), 2)
	await _shot("07_after_pan_begun_on_top_of_rock")
	_press(MOUSE_BUTTON_LEFT, false, scr + Vector2(-312.0, 192.0))
	await physics_frame
	await _drive(scr + Vector2(-312.0, 192.0), 4)

func _capture_held(kind: String) -> void:
	var obj := _grabbable(kind)
	if obj == null:
		print("  (no %s available)" % kind)
		return
	_frame_on(obj)
	await _settle(SETTLE_FRAMES)
	var scr := _screen_of(obj)
	await _drive(scr, REACH_FRAMES)
	_hand.simulate_grab(obj)
	await _drive(scr, HOLD_FRAMES)
	await _shot("08_held_" + kind)
	_hand.simulate_release_for_test(Vector3.ZERO, true)
	await _settle(4)

# --- Helpers -----------------------------------------------------------------

## Advance the real hand update seam for n rendered frames.
func _drive(screen_pos: Vector2, frames: int) -> void:
	for _i in frames:
		_hand._cancel_miracle(false)
		_hand._world_frame(screen_pos, STEP)
		await RenderingServer.frame_post_draw

func _settle(frames: int) -> void:
	for _i in frames:
		await RenderingServer.frame_post_draw

func _shot(label: String) -> void:
	await RenderingServer.frame_post_draw
	var img := root.get_texture().get_image()
	var path := _dir.path_join("%s.png" % label)
	var err := img.save_png(path)
	if err != OK:
		print("  FAILED to save %s (err %d)" % [path, err])
		return
	_shots += 1
	print("  saved %s" % path)

func _press(button: MouseButton, pressed: bool, at: Vector2) -> void:
	var ev := InputEventMouseButton.new()
	ev.button_index = button
	ev.pressed = pressed
	ev.position = at
	Input.parse_input_event(ev)

func _screen_of(obj: Node) -> Vector2:
	return _rig.camera.unproject_position(obj.pick_anchor_point())

## Put the QA camera close enough to judge contact. Inspection framing only —
## the game's own default camera is never changed by this tour.
func _frame_on(obj: Node) -> void:
	_rig.reset_to_safe_default()
	_rig.position = obj.global_position + Vector3(0.0, 1.0, 0.0)
	_rig.dist = 8.5
	_rig._dist_target = 8.5

func _grabbable(kind: String) -> Node:
	for g in get_nodes_in_group("grabbable"):
		if g.display_name == kind and not ("consumed" in g and g.consumed):
			return g
	return null

## Empty ground that is genuinely *on the island* and on screen. Searching raw
## screen space finds open water, which puts the hand out at sea and makes the
## frame useless for judging anything.
func _empty_screen_point() -> Vector2:
	var island := get_first_node_in_group("island")
	var grabbables := get_nodes_in_group("grabbable")
	var fallback := Vector2(720.0, 500.0)
	if island == null:
		return fallback
	for radius in [6.0, 10.0, 14.0, 18.0]:
		for step in 16:
			var ang: float = (step / 16.0) * TAU
			var world: Vector3 = island.ground_point(cos(ang) * radius, sin(ang) * radius)
			if not _rig.camera.is_position_in_frustum(world):
				continue
			var candidate: Vector2 = _rig.camera.unproject_position(world)
			if candidate.x < 140.0 or candidate.x > 1300.0 or candidate.y < 140.0 or candidate.y > 780.0:
				continue
			var clear := true
			for obj in grabbables:
				if obj == null or not is_instance_valid(obj):
					continue
				var anchor: Vector2 = _rig.camera.unproject_position(obj.pick_anchor_point())
				if candidate.distance_to(anchor) <= obj.hover_screen_radius + 16.0:
					clear = false
					break
			if clear:
				return candidate
	return fallback
