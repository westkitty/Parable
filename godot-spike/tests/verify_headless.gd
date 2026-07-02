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
	for action in ["hand_press", "camera_orbit", "camera_zoom_in",
			"camera_zoom_out", "gesture_mode", "cancel_action", "toggle_diagnostics"]:
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

	# 6. Temple interior scene instantiates with a camera.
	var interior_scene := load("res://scenes/TempleInterior.tscn")
	_check(interior_scene != null, "TempleInterior.tscn loads")
	var interior: Node = interior_scene.instantiate()
	root.add_child(interior)
	await process_frame
	_check(interior.get_node_or_null("InteriorCamera") != null, "temple interior has camera")

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

	# 8. Throw sampler basic sanity.
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
