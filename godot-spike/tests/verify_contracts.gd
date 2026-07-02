extends SceneTree

var _failures: Array[String] = []

func _initialize() -> void:
	_run.call_deferred()

func _run() -> void:
	print("== Parable spike contract verify ==")
	var identity: Node = load("res://scripts/god_identity.gd").new()
	identity.name = "GodIdentity"
	root.add_child(identity)
	var main_scene := load("res://scenes/Main.tscn")
	var main: Node = main_scene.instantiate()
	root.add_child(main)
	await process_frame
	await process_frame
	await process_frame
	for _i in 16:
		await physics_frame

	var hand := main.get_node("DivineHand")
	var island := main.get_node("Island")
	var shrine := main.get_node("Shrine")
	var temple: Node3D = load("res://scenes/TempleInterior.tscn").instantiate()
	root.add_child(temple)
	await process_frame

	var rock := _find_grabbable("rock")
	_check(rock != null, "rock exists")
	_check(hand.simulate_grab(rock), "rock grab contract")
	for _i in 4:
		await physics_frame
	_check(hand.is_carrying(), "rock remains held while simulated hold persists")
	hand.global_position = island.ground_point(1.5, 1.5) + Vector3(0.0, 1.8, 0.0)
	hand.simulate_release_for_test(Vector3.ZERO, true)
	for _i in 4:
		await physics_frame
	_check(not hand.is_carrying(), "rock release clears held object")
	_check(rock.global_position.y >= island.height_at(rock.global_position.x, rock.global_position.z) + 0.05,
		"rock gentle drop stays above terrain")

	_check(hand.simulate_grab(rock), "rock regrab contract")
	hand.simulate_release_for_test(Vector3(7.0, 4.0, 0.0))
	await physics_frame
	_check(rock.last_release_mode == "throw", "high velocity release uses throw path")

	var offering := _find_grabbable("offering")
	_check(offering != null, "offering exists")
	_check(hand.simulate_grab(offering), "offering grab contract")
	hand.global_position = shrine.altar_point() + Vector3(0.0, 0.8, 0.0)
	hand.simulate_release_for_test(Vector3.ZERO, true)
	for _i in 4:
		await physics_frame
	_check(shrine.is_awakened(), "gentle offering near shrine awakens shrine")

	var far_offering := _find_grabbable("offering")
	if far_offering != null:
		shrine.state = shrine.ShrineState.DORMANT
		_check(hand.simulate_grab(far_offering), "second offering grab contract")
		hand.global_position = shrine.altar_point() + Vector3(0.0, 0.8, 0.0)
		hand.simulate_release_for_test(Vector3(9.0, 5.0, 0.0))
		await physics_frame
		_check(shrine.state == shrine.ShrineState.DORMANT, "hard throw near shrine does not awaken")

	var inward := PackedVector2Array()
	for i in 40:
		var t := (i / 39.0) * PI * 2.3
		var radius := lerpf(110.0, 34.0, i / 39.0)
		inward.append(Vector2(220 + cos(-t) * radius, 220 + sin(-t) * radius))
	_check(GestureRecognizer.detect_spiral(inward).kind == "spiral", "inward clockwise spiral accepted")
	var outward := PackedVector2Array()
	for i in 40:
		var t2 := (i / 39.0) * PI * 2.2
		var radius2 := lerpf(36.0, 118.0, i / 39.0)
		outward.append(Vector2(220 + cos(-t2) * radius2, 220 + sin(-t2) * radius2))
	_check(GestureRecognizer.detect_spiral(outward).kind == "spiral", "outward clockwise spiral accepted")
	var double_loop := PackedVector2Array()
	for i in 50:
		var t3 := (i / 49.0) * TAU * 2.1
		double_loop.append(Vector2(220 + cos(-t3) * 72.0, 220 + sin(-t3) * 70.0))
	_check(GestureRecognizer.detect_spiral(double_loop).kind == "spiral", "two-loop clockwise fallback accepted")
	var random_short := PackedVector2Array([Vector2(0, 0), Vector2(10, 6), Vector2(14, 8), Vector2(18, 12)])
	_check(GestureRecognizer.detect_spiral(random_short).kind == "none", "random short movement rejected")
	var counter := PackedVector2Array()
	for i in 40:
		var t4 := (i / 39.0) * PI * 2.1
		var radius4 := lerpf(100.0, 40.0, i / 39.0)
		counter.append(Vector2(220 + cos(t4) * radius4, 220 + sin(t4) * radius4))
	_check(GestureRecognizer.detect_spiral(counter).kind == "none", "counterclockwise loop rejected")

	hand.simulate_arm_for_test()
	var hand_debug: Dictionary = hand.get_debug()
	_check(bool(hand_debug.get("trace_armed", false)) == true, "debug arm sets miracle armed")
	_check(hand.simulate_glyph_for_test("circle", Vector3.ZERO) == true, "armed circle uses blessing path")
	_check(bool(main.get("_ritual_started")) == true, "blessing triggers symbol ritual state")
	main._spawn_symbol_choices(Vector3.ZERO)
	_check(main.get("_symbol_choices").size() == 3, "symbol ritual path remains callable")

	_check(main.cast_glyph("zigzag", shrine.global_position) == false, "zigzag before shrine does not cast")
	shrine.state = shrine.ShrineState.AWAKENED
	hand.global_position = shrine.global_position + Vector3(0.0, 1.1, 0.0)
	_check(hand.simulate_glyph_for_test("zigzag", shrine.global_position) == true, "awakened shrine zigzag teaches bolt")
	_check(main.identity.learned_bolt == true, "bolt learned after shrine path")
	_check(hand.simulate_glyph_for_test("zigzag", Vector3(5.0, 0.0, 5.0)) == true, "learned bolt zigzag casts away from shrine")

	temple.enter(main)
	_check(temple.get_node_or_null("LeftHotspot") != null, "temple symbol chamber hotspot exists")
	_check(temple.get_node_or_null("RightHotspot") != null, "temple glyph chamber hotspot exists")
	_check(temple.get_node_or_null("ExitDoor") != null, "temple exit exists")
	temple.focus_symbol_chamber()
	_check(temple.current_chamber() == "left", "temple can focus symbol chamber")
	temple.focus_glyph_chamber()
	_check(temple.current_chamber() == "right", "temple can focus glyph chamber")
	_check(temple.has_method("exit_requested"), "temple exit handler callable")

	if _failures.is_empty():
		print("CONTRACT VERIFY: ALL CHECKS PASSED")
		quit(0)
	else:
		print("CONTRACT VERIFY: %d FAILURE(S)" % _failures.size())
		for f in _failures:
			print("  FAIL: " + f)
		quit(1)

func _find_grabbable(kind: String) -> Node:
	for g in get_nodes_in_group("grabbable"):
		if g.display_name != kind:
			continue
		if "consumed" in g and g.consumed:
			continue
		return g
	return null

func _check(cond: bool, label: String) -> void:
	if cond:
		print("  ok: " + label)
	else:
		_failures.append(label)
		print("  FAIL: " + label)
