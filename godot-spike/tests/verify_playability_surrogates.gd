extends SceneTree

var _failures: Array[String] = []

func _initialize() -> void:
	_run.call_deferred()

func _run() -> void:
	print("== Parable spike playability surrogate verify ==")
	var identity: Node = load("res://scripts/god_identity.gd").new()
	identity.name = "GodIdentity"
	root.add_child(identity)
	var main_scene := load("res://scenes/Main.tscn")
	var main: Node = main_scene.instantiate()
	root.add_child(main)
	await process_frame
	await process_frame
	await process_frame
	for _i in 18:
		await physics_frame

	var hand: Node = main.get_node("DivineHand")
	var rig: Node = main.get_node("CameraRig")
	var shrine: Node = main.get_node("Shrine")
	var diagnostics: CanvasLayer = main.get_node("DevDiagnostics")

	await _assert_stable_hold_and_release_modes(hand)
	await _assert_throw_threshold_edges(hand)
	await _assert_camera_motion_preserves_hold(hand, rig)
	await _assert_safe_cancel_clears_state(hand)
	await _assert_shrine_release_contract(hand, main, shrine)
	await _assert_glyph_learning_contract(hand, main, shrine)
	await _assert_temple_and_diagnostics_contract(main, diagnostics, shrine)

	if _failures.is_empty():
		print("PLAYABILITY SURROGATE VERIFY: ALL CHECKS PASSED")
		quit(0)
	else:
		print("PLAYABILITY SURROGATE VERIFY: %d FAILURE(S)" % _failures.size())
		for f in _failures:
			print("  FAIL: " + f)
		quit(1)

func _assert_stable_hold_and_release_modes(hand: Node) -> void:
	for kind in ["rock", "tree", "offering"]:
		var obj := _find_grabbable(kind)
		_check(obj != null, "%s exists for hold surrogate" % kind)
		if obj == null:
			continue
		_check(hand.simulate_grab(obj), "%s simulated grab succeeds" % kind)
		for _i in 5:
			await physics_frame
		_check(hand.is_carrying(), "%s remains held across physics frames" % kind)
		_check(obj.is_held == true, "%s owner state remains held" % kind)
		hand.simulate_release_for_test(Vector3.ZERO, true)
		for _i in 2:
			await physics_frame
		_check(obj.last_release_mode == "drop", "%s gentle release records drop" % kind)
		_check(obj.recent_gentle_release == true, "%s gentle release flag stays true" % kind)
		_check(hand.is_carrying() == false, "%s gentle release clears hand state" % kind)
		_check(hand.simulate_grab(obj), "%s regrab succeeds after gentle release" % kind)
		hand.simulate_release_for_test(Vector3(7.5, 4.0, 0.0))
		await physics_frame
		_check(obj.last_release_mode == "throw", "%s fast release records throw" % kind)
		_check(obj.last_release_speed > 0.0, "%s throw records non-zero speed" % kind)

func _assert_throw_threshold_edges(hand: Node) -> void:
	var rock := _find_grabbable("rock")
	_check(rock != null, "rock exists for threshold edge checks")
	if rock == null:
		return
	var threshold: float = hand.throw_min_speed_for_test()
	_check(hand.simulate_grab(rock), "threshold test grab succeeds")
	hand.simulate_release_for_test(Vector3(threshold - 0.05, 0.0, 0.0))
	await physics_frame
	_check(rock.last_release_mode == "drop", "release just below threshold stays gentle")
	_check(hand.simulate_grab(rock), "threshold test regrab succeeds")
	hand.simulate_release_for_test(Vector3(threshold + 0.05, 0.0, 0.0))
	await physics_frame
	_check(rock.last_release_mode == "throw", "release just above threshold throws")

func _assert_camera_motion_preserves_hold(hand: Node, rig: Node) -> void:
	var rock := _find_grabbable("rock")
	_check(rock != null, "rock exists for camera surrogate")
	if rock == null:
		return
	_check(hand.simulate_grab(rock), "camera surrogate grab succeeds")
	var before: Dictionary = rig.save_state()
	rig.pan_by(Vector3(3.0, 0.0, -2.5))
	rig.simulate_orbit_drag(Vector2(42.0, -18.0))
	rig.simulate_zoom_factor(1.0 / 1.12)
	await physics_frame
	var after: Dictionary = rig.save_state()
	_check(before.pos != after.pos, "camera pan changes rig position")
	_check(absf(float(before.yaw) - float(after.yaw)) > 0.001, "camera orbit changes yaw")
	_check(absf(float(before.pitch) - float(after.pitch)) > 0.001, "camera orbit changes pitch")
	_check(absf(float(before.dist) - float(after.dist)) > 0.001, "camera zoom changes distance target")
	_check(hand.is_carrying(), "camera motion does not drop held object")
	_check(rock.is_held == true, "camera motion does not corrupt held object state")
	hand.simulate_release_for_test(Vector3.ZERO, true)
	await physics_frame

func _assert_safe_cancel_clears_state(hand: Node) -> void:
	var tree := _find_grabbable("tree")
	_check(tree != null, "tree exists for cancel surrogate")
	if tree == null:
		return
	_check(hand.simulate_grab(tree), "cancel surrogate grab succeeds")
	hand.simulate_arm_for_test()
	hand.simulate_cancel_for_test()
	await physics_frame
	var debug: Dictionary = hand.get_debug()
	_check(hand.is_carrying() == false, "Esc surrogate clears held object")
	_check(tree.last_release_mode == "drop", "Esc surrogate uses gentle drop path")
	_check(bool(debug.get("trace_armed", true)) == false, "Esc surrogate clears miracle armed state")
	_check(float(debug.get("armed_timer", 1.0)) <= 0.01, "Esc surrogate clears miracle timer")
	_check(String(debug.get("state", "?")) == "hover", "Esc surrogate returns hand to hover state")

func _assert_shrine_release_contract(hand: Node, main: Node, shrine: Node) -> void:
	var offerings := _find_grabbables("offering")
	var gentle := offerings[0] if not offerings.is_empty() else null
	_check(gentle != null, "offering exists for gentle shrine contract")
	if gentle != null:
		shrine.state = shrine.ShrineState.DORMANT
		_check(hand.simulate_grab(gentle), "gentle shrine grab succeeds")
		hand.global_position = shrine.altar_point() + Vector3(0.0, 0.8, 0.0)
		hand.simulate_release_for_test(Vector3.ZERO, true)
		for _i in 4:
			await physics_frame
		_check(shrine.is_awakened(), "gentle shrine placement awakens shrine")

	var hard := offerings[1] if offerings.size() > 1 else _spawn_test_offering(main)
	_check(hard != null, "offering exists for hard-throw shrine rejection")
	if hard != null:
		shrine.state = shrine.ShrineState.DORMANT
		_check(hand.simulate_grab(hard), "hard-throw shrine grab succeeds")
		hand.global_position = shrine.altar_point() + Vector3(0.0, 0.8, 0.0)
		hand.simulate_release_for_test(Vector3(8.5, 4.0, 0.0))
		await physics_frame
		_check(shrine.state == shrine.ShrineState.DORMANT, "hard throw near altar does not awaken shrine")
		_check(shrine.last_reject_reason() == "offering_throw", "hard throw records explicit shrine reject reason")

func _assert_glyph_learning_contract(hand: Node, main: Node, shrine: Node) -> void:
	_check(main.cast_glyph("zigzag", shrine.global_position) == false, "zigzag remains locked before shrine teaching")
	shrine.state = shrine.ShrineState.AWAKENED
	hand.global_position = shrine.global_position + Vector3(0.0, 1.2, 0.0)
	_check(hand.simulate_glyph_for_test("zigzag", shrine.global_position) == true, "awakened shrine teaches zigzag")
	_check(main.identity.learned_bolt == true, "zigzag teaching flips learned_bolt")
	_check(hand.simulate_glyph_for_test("zigzag", Vector3(6.0, 0.0, 6.0)) == true, "learned zigzag casts away from shrine")

func _assert_temple_and_diagnostics_contract(main: Node, diagnostics: CanvasLayer, shrine: Node) -> void:
	var temple: Node = load("res://scenes/TempleInterior.tscn").instantiate()
	root.add_child(temple)
	await process_frame
	temple.enter(main)
	_check(main.current_temple_chamber() == "-", "world chamber label stays world-side before linking interior")
	main._interior = temple
	main._in_temple = true
	temple.focus_symbol_chamber()
	_check(main.current_temple_chamber() == "left", "world reports left temple chamber")
	temple.focus_glyph_chamber()
	_check(main.current_temple_chamber() == "right", "world reports right temple chamber")

	diagnostics.visible = true
	var lines: Array[String] = diagnostics.snapshot_lines()
	var text := "\n".join(lines)
	_check(text.contains("right mouse down:"), "diagnostics expose right mouse state")
	_check(text.contains("last release mode:"), "diagnostics expose release mode")
	_check(text.contains("miracle armed:"), "diagnostics expose miracle armed state")
	_check(text.contains("shrine reject:"), "diagnostics expose shrine reject reason")
	_check(text.contains("nearest offering dist:"), "diagnostics expose offering distance")
	_check(text.contains("temple chamber: right"), "diagnostics expose temple chamber")
	_check(text.contains("camera:"), "diagnostics expose camera state")
	shrine.state = shrine.ShrineState.DORMANT
	main._in_temple = false
	temple.leave()

func _find_grabbable(kind: String) -> Node:
	var matches := _find_grabbables(kind)
	return matches[0] if not matches.is_empty() else null

func _find_grabbables(kind: String) -> Array[Node]:
	var matches: Array[Node] = []
	for g in get_nodes_in_group("grabbable"):
		if g.display_name != kind:
			continue
		if "consumed" in g and g.consumed:
			continue
		matches.append(g)
	return matches

func _spawn_test_offering(main: Node) -> Node:
	var offering_scene := load("res://scenes/objects/Offering.tscn")
	if offering_scene == null:
		return null
	var offering: Node = offering_scene.instantiate()
	main.get_node("Grabbables").add_child(offering)
	offering.place_on_surface(main.get_node("Island"), Vector2(-9.0, -3.0))
	main._connect_release_contract(offering)
	return offering

func _check(cond: bool, label: String) -> void:
	if cond:
		print("  ok: " + label)
	else:
		_failures.append(label)
		print("  FAIL: " + label)
