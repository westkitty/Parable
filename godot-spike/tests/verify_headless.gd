extends SceneTree
## Headless smoke test. Run with:
##   godot --headless --path . --script res://tests/verify_headless.gd
## Loads every script, instantiates the scenes, asserts the contract nodes
## exist, and unit-checks the gesture recognizer. Exit 0 = pass.
## This proves structure and parseability — it can NOT prove rendering,
## input feel, or godhood. Only Andrew can.

const SCRIPTS: Array[String] = [
	"res://scripts/god_identity.gd",
	"res://scripts/witness_director.gd",
	"res://scripts/throw_sampler.gd",
	"res://scripts/gesture_recognizer.gd",
	"res://scripts/symbol_forms.gd",
	"res://scripts/island.gd",
	"res://scripts/grabbable.gd",
	"res://scripts/villager_proxy.gd",
	"res://scripts/rock_proxy.gd",
	"res://scripts/tree_proxy.gd",
	"res://scripts/offering_proxy.gd",
	"res://scripts/camera_rig.gd",
	"res://scripts/hand_input.gd",
	"res://scripts/hand_visual.gd",
	"res://scripts/gesture_trace.gd",
	"res://scripts/shrine.gd",
	"res://scripts/temple_door.gd",
	"res://scripts/temple_interior.gd",
	"res://scripts/symbol_choice.gd",
	"res://scripts/world.gd",
	"res://scripts/diagnostics.gd",
	"res://scripts/miracle_fx.gd",
]

var _failures: Array[String] = []

func _initialize() -> void:
	_run.call_deferred()

func _run() -> void:
	print("== Parable spike headless verify ==")

	# 1. Every script must load (loading compiles it).
	for path in SCRIPTS:
		var s := load(path)
		_check(s != null, "script loads: " + path)

	# 2. Input actions must be defined in project settings.
	for action in ["grab_action", "pan_action", "interact_action", "camera_orbit",
			"camera_zoom_in", "camera_zoom_out", "gesture_mode", "cancel_action", "toggle_diagnostics"]:
		var ok := InputMap.has_action(action) or ProjectSettings.has_setting("input/" + action)
		_check(ok, "input action defined: " + action)

	# 3. Identity defaults: starter learned, bolt unlearned, no symbol.
	var identity: Node = load("res://scripts/god_identity.gd").new()
	identity.name = "GodIdentity"
	root.add_child(identity)
	_check(identity.learned_blessing == true, "identity: starter blessing learned")
	_check(identity.learned_bolt == false, "identity: bolt unlearned at start")
	_check(identity.symbol == "", "identity: no symbol at start")

	# 4. Main scene instantiates and builds its cast.
	var main_scene := load("res://scenes/Main.tscn")
	_check(main_scene != null, "Main.tscn loads")
	var main: Node = main_scene.instantiate()
	root.add_child(main)
	await process_frame
	await process_frame
	await process_frame
	for _i in 12:
		await physics_frame

	for node_name in ["Island", "CameraRig", "DivineHand", "Grabbables",
			"Shrine", "TempleDoorway", "GestureTrace", "DevDiagnostics",
			"WitnessDirector", "Sun"]:
		_check(main.get_node_or_null(node_name) != null, "node exists: " + node_name)
	_check(main.get_node_or_null("CameraRig/Pitch/Camera3D") != null, "node exists: CameraRig/Pitch/Camera3D")
	_check(main.get_node_or_null("DivineHand/HandVisual") != null, "node exists: DivineHand/HandVisual")

	# 5. Grabbable cast: all four classes present, and only grabbables in group.
	var classes := {}
	for g in get_nodes_in_group("grabbable"):
		_check(g is RigidBody3D, "grabbable is RigidBody3D: " + str(g.name))
		classes[g.display_name] = classes.get(g.display_name, 0) + 1
	for cls in ["villager", "rock", "tree", "offering"]:
		_check(classes.get(cls, 0) > 0, "grabbable class present: %s (x%d)" % [cls, classes.get(cls, 0)])
	_check(not main.get_node("Island").is_in_group("grabbable"), "island is NOT grabbable")
	_check(not main.get_node("Shrine").is_in_group("grabbable"), "shrine is NOT grabbable")
	_check(not main.get_node("TempleDoorway").is_in_group("grabbable"), "temple doorway is NOT grabbable")
	var island := main.get_node("Island")
	for g in get_nodes_in_group("grabbable"):
		_check(g.ground_clearance > 0.0, "grabbable clearance configured: %s" % g.display_name)
		_check(g.global_position.y > -8.0, "grabbable above safety floor: %s" % g.display_name)
		_check(g.global_position.y >= island.height_at(g.global_position.x, g.global_position.z) - 0.2,
			"grabbable not below terrain: %s" % g.display_name)
		if g.display_name in ["rock", "offering"]:
			_check(g.global_position.y >= island.height_at(g.global_position.x, g.global_position.z) + 0.1,
				"object starts visibly above ground: %s" % g.display_name)
		_check(g.recovery_count == 0, "no recovery needed at startup: %s" % g.display_name)

	# 6. Temple interior scene instantiates with a camera.
	var interior_scene := load("res://scenes/TempleInterior.tscn")
	_check(interior_scene != null, "TempleInterior.tscn loads")
	var interior: Node = interior_scene.instantiate()
	root.add_child(interior)
	await process_frame
	_check(interior.get_node_or_null("InteriorCamera") != null, "temple interior has camera")
	for temple_node in ["LeftHotspot", "RightHotspot", "ExitDoor"]:
		_check(interior.get_node_or_null(temple_node) != null, "temple interaction exists: " + temple_node)

	# 6b. Orbit binding: middle mouse primary.
	var orbit_events := InputMap.action_get_events("camera_orbit")
	var has_middle := false
	for e in orbit_events:
		if e is InputEventMouseButton and e.button_index == MOUSE_BUTTON_MIDDLE:
			has_middle = true
	_check(has_middle, "input map binds camera_orbit to middle mouse")

	# 7. Recognizer: synthetic circle, zigzag, straight line.
	var circle := PackedVector2Array()
	for i in 40:
		var t := (i / 39.0) * TAU
		circle.append(Vector2(200.0 + cos(t) * 100.0, 200.0 + sin(t) * 100.0))
	var r1: Dictionary = GestureRecognizer.classify(circle)
	_check(r1.kind == "circle", "recognizer: circle detected (got %s)" % r1.kind)

	var zigzag := PackedVector2Array()
	for i in 13:
		zigzag.append(Vector2(200.0 + (34.0 if i % 2 == 0 else -34.0), 100.0 + i * 26.0))
	var r2: Dictionary = GestureRecognizer.classify(zigzag)
	_check(r2.kind == "zigzag", "recognizer: zigzag detected (got %s)" % r2.kind)

	var line := PackedVector2Array()
	for i in 20:
		line.append(Vector2(200.0, 100.0 + i * 18.0))
	var r3: Dictionary = GestureRecognizer.classify(line)
	_check(r3.kind == "none", "recognizer: straight line rejected (got %s)" % r3.kind)

	var spiral := PackedVector2Array()
	for i in 40:
		var t := (i / 39.0) * PI * 2.4
		var radius := lerpf(120.0, 35.0, i / 39.0)
		spiral.append(Vector2(240.0 + cos(-t) * radius, 220.0 + sin(-t) * radius))
	var r4: Dictionary = GestureRecognizer.detect_spiral(spiral)
	_check(r4.kind == "spiral", "recognizer: clockwise spiral arming detected (got %s)" % r4.kind)
	var spiral_out := PackedVector2Array()
	for i in 40:
		var t2 := (i / 39.0) * PI * 2.1
		var radius2 := lerpf(34.0, 118.0, i / 39.0)
		spiral_out.append(Vector2(240.0 + cos(-t2) * radius2, 220.0 + sin(-t2) * radius2))
	var r5: Dictionary = GestureRecognizer.detect_spiral(spiral_out)
	_check(r5.kind == "spiral", "recognizer: outward clockwise spiral detected (got %s)" % r5.kind)

	# 8. Blessing reliably starts the ritual and shrine learning gates bolt.
	var world_script := load("res://scripts/world.gd")
	_check(world_script != null, "world script loads for ritual contract")
	_check(main.cast_glyph("circle", Vector3.ZERO) == true, "starter blessing cast succeeds")
	_check(bool(main.get("_ritual_started")) == true, "starter blessing arms symbol ritual")
	main._spawn_symbol_choices(Vector3.ZERO)
	_check(main.get("_symbol_choices").size() == 3, "symbol ritual creates 3 choices")
	var choices: Array = main.get("_symbol_choices")
	if choices.size() == 3:
		var sep_a: float = choices[0].global_position.distance_to(choices[1].global_position)
		var sep_b: float = choices[1].global_position.distance_to(choices[2].global_position)
		_check(sep_a > 2.0 and sep_b > 2.0, "symbol choices are visibly separated")
	var shrine := main.get_node("Shrine")
	_check(main.cast_glyph("zigzag", shrine.global_position) == false, "bolt starts locked before shrine path")
	var offering: Node = null
	for g in get_nodes_in_group("grabbable"):
		if g.display_name == "offering":
			offering = g
			break
	_check(offering != null, "offering exists for shrine path")
	if offering != null:
		shrine.receive_offering(offering)
		_check(shrine.is_awakened(), "shrine awakens after offering")
		main.get_node("DivineHand").global_position = shrine.global_position + Vector3(0.0, 1.2, 0.0)
		_check(main.cast_glyph("zigzag", shrine.global_position) == true, "zigzag teaches at shrine after awakening")
		_check(main.identity.learned_bolt == true, "bolt becomes learned after shrine path")

	# 9. Throw sampler basic sanity.
	var sampler := ThrowSampler.new()
	sampler.add_sample(Vector3.ZERO, 0.0)
	sampler.add_sample(Vector3(1.0, 0.0, 0.0), 0.1)
	var v := sampler.velocity()
	_check(absf(v.x - 10.0) < 0.01, "throw sampler: velocity math (got %.2f)" % v.x)

	# --- Verdict ---
	if _failures.is_empty():
		print("HEADLESS VERIFY: ALL CHECKS PASSED")
		print("(Structure only. Rendering, input feel, and godhood are Andrew's to judge.)")
		quit(0)
	else:
		print("HEADLESS VERIFY: %d FAILURE(S)" % _failures.size())
		for f in _failures:
			print("  FAIL: " + f)
		quit(1)

func _check(cond: bool, label: String) -> void:
	if cond:
		print("  ok: " + label)
	else:
		_failures.append(label)
		print("  FAIL: " + label)
