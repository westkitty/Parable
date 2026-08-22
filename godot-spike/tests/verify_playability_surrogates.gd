extends SceneTree

## Minimum separation that makes a reach surrogate meaningful: below this the
## hand is already effectively on the object and easing proves nothing.
const REACH_STEP_MIN := 0.6

var _failures: Array[String] = []

func _initialize() -> void:
	_run.call_deferred()

func _run() -> void:
	print("== Parable spike playability surrogate verify ==")
	root.set_size(Vector2i(1440, 900))
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
	var trace: Node = main.get_node("GestureTrace")

	_check(main.mouse_hidden_for_play() == true, "cursor hide call path exists in world boot path")
	_check(main.has_method("cursor_policy_state"), "cursor policy helper exists")
	_check(main.has_method("cursor_focus_state"), "cursor focus helper exists")
	_check(main.has_method("simulate_focus_loss_for_test"), "world exposes focus-loss surrogate helper")
	_check(main.has_method("simulate_focus_gain_for_test"), "world exposes focus-gain surrogate helper")
	_check(rig.has_method("middle_button_down"), "camera middle-button helper exists")
	_check(rig.has_method("orbit_source"), "camera orbit-source helper exists")
	_check(rig.has_method("clear_transient_input"), "camera transient input clear helper exists")
	_check(rig.has_method("simulate_zoom_step_for_test"), "camera bounded zoom-step helper exists")
	_check(hand.has_method("simulate_right_mouse_press_for_test"), "hand exposes right-click hover contract helper")
	_check(hand.has_method("simulate_empty_left_drag_for_test"), "hand exposes empty-left-drag pan surrogate helper")
	_check(hand.has_method("hold_debug_marker_path_exists_for_test"), "hand exposes pooled hold-debug marker helper")
	_check(hand.hold_debug_marker_path_exists_for_test(), "F3 hold-debug marker path exists")
	_check(trace.has_method("active_mote_count"), "gesture trace exposes bounded mote helper")
	await _assert_current_frame_input_seam(hand, rig)
	await _assert_m1_hands_on_the_world(hand, rig)
	await _assert_patch08_input_contract(hand, rig, main)
	await _assert_stable_hold_and_release_modes(hand)
	await _assert_throw_threshold_edges(hand)
	await _assert_camera_motion_preserves_hold(hand, rig)
	await _assert_safe_cancel_clears_state(hand)
	await _assert_shrine_release_contract(hand, main, shrine)
	await _assert_glyph_learning_contract(hand, main, shrine)
	await _assert_temple_and_diagnostics_contract(main, diagnostics, shrine, trace)

	if _failures.is_empty():
		print("PLAYABILITY SURROGATE VERIFY: ALL CHECKS PASSED")
		quit(0)
	else:
		print("PLAYABILITY SURROGATE VERIFY: %d FAILURE(S)" % _failures.size())
		for f in _failures:
			print("  FAIL: " + f)
		quit(1)

func _assert_current_frame_input_seam(hand: Node, rig: Node) -> void:
	var rocks := _find_grabbables("rock")
	_check(rocks.size() >= 3, "three rocks exist for current-frame targeting proof")
	if rocks.size() < 3:
		return

	# Headless Godot updates button action state from parsed events, but does not
	# deliver the OS cursor position to the viewport. Keep the decisive proof at
	# the real hand update seam and pass each current pointer position directly.
	hand.enabled = false
	hand._refresh_grabbables()
	var empty := _find_empty_screen_point(rig)
	var rock_a: Node = rocks[0]
	var rock_b: Node = rocks[2]
	var point_a: Vector2 = rig.camera.unproject_position(rock_a.pick_anchor_point())
	var point_b: Vector2 = rig.camera.unproject_position(rock_b.pick_anchor_point())

	hand._world_frame(point_a, 0.0)
	_check(String(hand.get_debug().get("hovered", "?")) == String(rock_a.display_name),
		"current-frame first update over rock hovers that rock")
	hand._cancel_miracle(false)
	hand._world_frame(empty, 0.0)
	_check(String(hand.get_debug().get("hovered", "?")) == "-",
		"current-frame move from rock to empty clears hover immediately")

	await _inject_mouse_button(MOUSE_BUTTON_RIGHT, true, point_a)
	hand._world_frame(point_a, 0.0)
	_check(rock_a.is_held == true and hand.is_carrying(),
		"RMB acquires the current rock on the first attempt")
	await _inject_mouse_button(MOUSE_BUTTON_RIGHT, false, point_a)
	hand._world_frame(point_a, 0.0)
	_check(hand.is_carrying() == false and rock_a.is_held == false,
		"current-frame RMB release clears the held rock")
	hand._cancel_miracle(false)

	# Two direct updates model a rapid A -> B move; the following RMB event must
	# observe B, not the object from the previous update.
	hand._world_frame(point_a, 0.0)
	hand._cancel_miracle(false)
	hand._world_frame(point_b, 0.0)
	_check(String(hand.get_debug().get("hovered", "?")) == String(rock_b.display_name),
		"rapid A-to-B movement updates hover to B before RMB")
	await _inject_mouse_button(MOUSE_BUTTON_RIGHT, true, point_b)
	hand._world_frame(point_b, 0.0)
	_check(rock_b.is_held == true and rock_a.is_held == false,
		"rapid A-to-B RMB acquires B and never A")
	await _inject_mouse_button(MOUSE_BUTTON_RIGHT, false, point_b)
	hand._world_frame(point_b, 0.0)
	_check(hand.is_carrying() == false, "rapid-target RMB release clears carry")
	hand._cancel_miracle(false)

	# The empty update clears hover before LMB is evaluated. The next update
	# crosses the existing drag threshold and must move the camera immediately.
	hand._world_frame(point_a, 0.0)
	hand._cancel_miracle(false)
	hand._world_frame(empty, 0.0)
	_check(String(hand.get_debug().get("hovered", "?")) == "-",
		"object-to-empty transition leaves no stale hover blocker for pan")
	var camera_before: Dictionary = rig.save_state()
	await _inject_mouse_button(MOUSE_BUTTON_LEFT, true, empty)
	hand._world_frame(empty, 0.0)
	await physics_frame
	var moved := empty + Vector2(60.0, -40.0)
	hand._world_frame(moved, 0.0)
	var camera_after: Dictionary = rig.save_state()
	_check(bool(hand.get_debug().get("pan_active", false)),
		"immediate empty-ground LMB drag enters pan")
	_check(camera_before.pos.distance_to(camera_after.pos) > 0.2,
		"immediate empty-ground LMB drag moves the camera target")
	await _inject_mouse_button(MOUSE_BUTTON_LEFT, false, moved)
	hand._world_frame(moved, 0.0)
	hand._cancel_miracle(false)
	rig.reset_to_safe_default()
	hand.enabled = true

## Stand-in for a world target that answers a god click (temple doorway, symbol
## choice). Used so click delivery can be proven without running the temple flow.
class ClickProbe extends Area3D:
	var clicks := 0
	func on_god_click(_world: Node) -> void:
		clicks += 1

## M1 — HANDS ON THE WORLD.
## Everything here drives the real _world_frame press arbitration rather than the
## simulate_* shortcuts, except the four-class hold geometry sweep, whose input
## path is already proven on the rock immediately above it.
func _assert_m1_hands_on_the_world(hand: Node, rig: Node) -> void:
	var rock := _find_grabbable("rock")
	_check(rock != null, "rock exists for M1 hands-on-the-world surrogates")
	if rock == null:
		return

	hand.enabled = false
	hand._refresh_grabbables()
	var empty := _find_empty_screen_point(rig)
	var rock_screen: Vector2 = rig.camera.unproject_position(rock.pick_anchor_point())

	# --- Reach reads as contact, not as burial ------------------------------
	hand._cancel_miracle(false)
	hand._world_frame(rock_screen, 0.0)
	_check(String(hand.get_debug().get("hovered", "?")) == String(rock.display_name),
		"reach pose does not disturb which object is targeted")
	var contact: Vector3 = rock.grip_contact_point()
	var palm: Vector3 = hand.get_debug().get("palm_center", Vector3.ZERO)
	var grip: Vector3 = hand.get_debug().get("grip_point", Vector3.ZERO)
	_check(palm.y > contact.y, "reaching palm rides above the rock's contact point")
	_check(rig.camera.unproject_position(palm).y <= rig.camera.unproject_position(contact).y,
		"reaching hand renders above its contact point, never under the rock")
	_check(grip.distance_to(contact) < 0.5,
		"reach lands the grip socket on the rock's own contact point")

	# --- Reach is a travelled movement, not a teleport ----------------------
	hand._cancel_miracle(false)
	hand._world_frame(empty, 0.0)
	var start_pos: Vector3 = hand.global_position
	var reach_target: Vector3 = hand.reach_target_for(rock)
	_check(start_pos.distance_to(reach_target) > REACH_STEP_MIN,
		"reach surrogate starts genuinely away from the object")
	hand._cancel_miracle(false)
	hand._world_frame(rock_screen, 1.0 / 60.0)
	var stepped: Vector3 = hand.global_position
	_check(stepped.distance_to(reach_target) < start_pos.distance_to(reach_target),
		"one hover frame moves the hand toward the object")
	_check(stepped.distance_to(reach_target) > 0.01,
		"the hand travels to the object rather than teleporting onto it")
	_check(String(hand._visual.pose_name()) == "reach",
		"a hand still closing on an object uses the reach pose")
	for i in 40:
		hand._cancel_miracle(false)
		hand._world_frame(rock_screen, 1.0 / 60.0)
	_check(hand.global_position.distance_to(hand.reach_target_for(rock)) < 0.05,
		"a short reach settles onto the object's contact pose")
	_check(hand.hand_has_reached_target(), "settled reach reports contact")
	_check(String(hand._visual.pose_name()) == "grip",
		"a settled reach closes the hand into a grip pose")

	# --- RMB acquisition from the reached pose ------------------------------
	await _inject_mouse_button(MOUSE_BUTTON_RIGHT, true, rock_screen)
	hand._world_frame(rock_screen, 0.0)
	_check(rock.is_held and hand.is_carrying(), "RMB acquires the rock the hand has reached")
	var held_palm: Vector3 = hand.get_debug().get("palm_center", Vector3.ZERO)
	var held_contact: Vector3 = rock.grip_contact_point()
	# The grip socket and the contact point coincide by construction, so on screen
	# they differ only by sub-pixel perspective. The load-bearing claim is that the
	# palm renders above the rock's body rather than under it.
	_check(rig.camera.unproject_position(held_palm).y
			<= rig.camera.unproject_position(held_contact).y + 2.0,
		"held rock keeps its contact point at the palm, not above it")
	_check(rig.camera.unproject_position(held_palm).y
			< rig.camera.unproject_position(rock.global_position).y,
		"held rock hangs below the palm on screen")
	_check(held_palm.y > held_contact.y, "held rock's contact sits under the palm in world space")
	await _inject_mouse_button(MOUSE_BUTTON_RIGHT, false, rock_screen)
	hand._world_frame(rock_screen, 0.0)
	_check(hand.is_carrying() == false and rock.is_held == false, "M1 acquisition releases cleanly")

	# --- The headline: LMB pan from inside a grabbable's hover halo ----------
	hand._cancel_miracle(false)
	hand._world_frame(rock_screen, 0.0)
	_check(String(hand.get_debug().get("hovered", "?")) == String(rock.display_name),
		"pan-from-hover surrogate presses genuinely inside the rock's hover halo")
	var pan_before: Dictionary = rig.save_state()
	await _inject_mouse_button(MOUSE_BUTTON_LEFT, true, rock_screen)
	hand._world_frame(rock_screen, 0.0)
	_check(String(hand.get_debug().get("input_mode", "?")) == "pending_pan",
		"LMB pressed on a hovered grabbable arms a pan instead of dying")
	await physics_frame
	var dragged := rock_screen + Vector2(58.0, -44.0)
	hand._world_frame(dragged, 0.0)
	var pan_after: Dictionary = rig.save_state()
	_check(bool(hand.get_debug().get("pan_active", false)),
		"a drag begun inside a hover halo enters pan")
	_check(pan_before.pos.distance_to(pan_after.pos) > 0.2,
		"a drag begun inside a hover halo moves the camera")
	_check(hand.is_carrying() == false and rock.is_held == false,
		"panning never acquires the object under the press")
	_check(bool(hand.get_debug().get("trace_armed", false)) == false,
		"panning never arms a miracle")
	await _inject_mouse_button(MOUSE_BUTTON_LEFT, false, dragged)
	hand._world_frame(dragged, 0.0)
	_check(hand.is_carrying() == false, "releasing a pan never drops an object into the world")

	# The pan above moved the camera, so re-derive where the rock now projects.
	rock_screen = rig.camera.unproject_position(rock.pick_anchor_point())

	# --- A deliberate small press must not jog the camera -------------------
	hand._cancel_miracle(false)
	hand._world_frame(rock_screen, 0.0)
	var tiny_before: Dictionary = rig.save_state()
	await _inject_mouse_button(MOUSE_BUTTON_LEFT, true, rock_screen)
	hand._world_frame(rock_screen, 0.0)
	await physics_frame
	var tiny := rock_screen + Vector2(4.0, -3.0)
	hand._world_frame(tiny, 0.0)
	_check(_camera_state_close(tiny_before, rig.save_state()),
		"a sub-threshold LMB press on a grabbable does not jog the camera")
	_check(hand.is_carrying() == false, "LMB on a grabbable never grabs")
	await _inject_mouse_button(MOUSE_BUTTON_LEFT, false, tiny)
	hand._world_frame(tiny, 0.0)

	# --- RMB targeting stays independent of the LMB gesture -----------------
	rock_screen = rig.camera.unproject_position(rock.pick_anchor_point())
	hand._cancel_miracle(false)
	hand._world_frame(rock_screen, 0.0)
	_check(String(hand.get_debug().get("hovered", "?")) == String(rock.display_name),
		"the rock is still targetable after a pan gesture")
	await _inject_mouse_button(MOUSE_BUTTON_RIGHT, true, rock_screen)
	hand._world_frame(rock_screen, 0.0)
	_check(rock.is_held, "RMB still acquires after LMB pan gestures")
	await _inject_mouse_button(MOUSE_BUTTON_RIGHT, false, rock_screen)
	hand._world_frame(rock_screen, 0.0)
	_check(hand.is_carrying() == false, "post-pan RMB release clears carry")

	await _assert_m1_click_targets_survive_pan(hand, rig, rock)
	await _assert_m1_hold_contact_geometry(hand, rig)

	hand._cancel_miracle(false)
	rig.reset_to_safe_default()
	hand.enabled = true

func _assert_m1_click_targets_survive_pan(hand: Node, rig: Node, rock: Node) -> void:
	var probe := ClickProbe.new()
	probe.name = "M1ClickProbe"
	probe.collision_layer = 4
	probe.collision_mask = 0
	probe.monitoring = false
	var col := CollisionShape3D.new()
	var sphere := SphereShape3D.new()
	sphere.radius = 1.0
	col.shape = sphere
	probe.add_child(col)
	root.add_child(probe)
	probe.global_position = rock.global_position + Vector3(0.0, 3.2, 0.0)
	await physics_frame
	var probe_screen: Vector2 = rig.camera.unproject_position(probe.global_position)

	hand._cancel_miracle(false)
	hand._world_frame(probe_screen, 0.0)
	await _inject_mouse_button(MOUSE_BUTTON_LEFT, true, probe_screen)
	hand._world_frame(probe_screen, 0.0)
	_check(String(hand.get_debug().get("input_mode", "?")) == "pending_click",
		"LMB on an interactive target still arms a click")
	await _inject_mouse_button(MOUSE_BUTTON_LEFT, false, probe_screen)
	hand._world_frame(probe_screen, 0.0)
	_check(probe.clicks == 1, "a clean click on an interactive target still fires")

	var click_before: Dictionary = rig.save_state()
	await _inject_mouse_button(MOUSE_BUTTON_LEFT, true, probe_screen)
	hand._world_frame(probe_screen, 0.0)
	await physics_frame
	var probe_drag := probe_screen + Vector2(-62.0, 38.0)
	hand._world_frame(probe_drag, 0.0)
	_check(bool(hand.get_debug().get("pan_active", false)),
		"dragging away from an interactive target resolves into pan")
	_check(click_before.pos.distance_to(rig.save_state().pos) > 0.2,
		"a drag begun on an interactive target moves the camera")
	await _inject_mouse_button(MOUSE_BUTTON_LEFT, false, probe_drag)
	hand._world_frame(probe_drag, 0.0)
	_check(probe.clicks == 1, "a drag begun on an interactive target does not also click")
	probe.queue_free()
	await physics_frame

## Held objects must hang below the palm and stay outside it, for every class.
func _assert_m1_hold_contact_geometry(hand: Node, rig: Node) -> void:
	for kind in ["rock", "villager", "offering", "tree"]:
		var obj := _find_grabbable(kind)
		_check(obj != null, "M1 hold-contact sweep finds a " + kind)
		if obj == null:
			continue
		_check(hand.simulate_grab(obj), "M1 hold-contact sweep grabs the " + kind)
		var screen_pos: Vector2 = rig.camera.unproject_position(obj.pick_anchor_point())
		hand._cancel_miracle(false)
		hand._world_frame(screen_pos, 0.0)
		var palm: Vector3 = hand.get_debug().get("palm_center", Vector3.ZERO)
		var contact: Vector3 = obj.grip_contact_point()
		_check(rig.camera.unproject_position(palm).y <= rig.camera.unproject_position(contact).y + 2.0,
			"held " + kind + " renders below the palm, not on top of it")
		_check(obj.global_position.y < palm.y,
			"held " + kind + " hangs below the palm instead of sitting inside it")
		_check(contact.distance_to(hand.get_debug().get("grip_point", Vector3.ZERO)) < 0.25,
			"held " + kind + " keeps its contact point in the grip socket")
		if kind == "tree":
			# The canopy sits well above the grip. Rendered QA caught the hand
			# being swallowed by it, which no state assertion could have seen.
			_check(palm.y < _topmost_mesh_bottom(obj),
				"held tree keeps the hand clear of its canopy")
		hand.simulate_release_for_test(Vector3.ZERO, true)
		await physics_frame

## World Y of the underside of an object's highest mesh - the canopy, for a tree.
func _topmost_mesh_bottom(obj: Node3D) -> float:
	var best_center := -INF
	var best_bottom := -INF
	for child in obj.get_children():
		if not (child is MeshInstance3D) or child.mesh == null:
			continue
		var aabb: AABB = child.mesh.get_aabb()
		var bottom: float = obj.global_position.y + child.position.y + aabb.position.y
		var center: float = bottom + aabb.size.y * 0.5
		if center > best_center:
			best_center = center
			best_bottom = bottom
	return best_bottom

func _inject_mouse_button(button: MouseButton, pressed: bool, position: Vector2) -> void:
	var event := InputEventMouseButton.new()
	event.button_index = button
	event.pressed = pressed
	event.position = position
	Input.parse_input_event(event)
	await physics_frame

func _find_empty_screen_point(rig: Node) -> Vector2:
	var grabbables: Array[Node] = get_nodes_in_group("grabbable")
	for y in range(80, 840, 80):
		for x in range(80, 1360, 80):
			var candidate := Vector2(x, y)
			var clear := true
			for obj in grabbables:
				if obj == null or not is_instance_valid(obj):
					continue
				var anchor: Vector2 = rig.camera.unproject_position(obj.pick_anchor_point())
				if candidate.distance_to(anchor) <= obj.hover_screen_radius + 8.0:
					clear = false
					break
			if clear:
				return candidate
	return Vector2(1100.0, 760.0)

func _assert_stable_hold_and_release_modes(hand: Node) -> void:
	var diagnostics: CanvasLayer = get_first_node_in_group("diagnostics")
	for kind in ["rock", "villager", "tree", "offering"]:
		var obj := _find_grabbable(kind)
		_check(obj != null, "%s exists for hold surrogate" % kind)
		if obj == null:
			continue
		_check(hand.simulate_grab(obj), "%s simulated grab succeeds" % kind)
		var visual: Node = hand.get_node("HandVisual")
		var debug: Dictionary = hand.get_debug()
		_check(String(obj.hold_profile) == kind, "%s has explicit hold profile" % kind)
		_check(obj.get_node_or_null("GripContact") != null, "%s has GripContact node" % kind)
		_check(obj.get_node_or_null("GripContact/HoldAnchor") != null, "%s has HoldAnchor compatibility node" % kind)
		_check(String(debug.get("hold_profile", "-")) == kind, "%s activates matching hold profile" % kind)
		_check(String(debug.get("hand_pose", "-")) == "carry", "%s closes hand into carry pose" % kind)
		_check(float(debug.get("carry_curl", 0.0)) >= 1.4, "%s carry pose has readable curl" % kind)
		_check(bool(debug.get("grip_cup_visible", false)) == true, "%s contact grip geometry appears only while held" % kind)
		_check(obj.pick_anchor_offset != Vector3.ZERO, "%s pick anchor offset configured" % kind)
		_check(obj.hover_screen_radius <= 80.0, "%s pickup radius is not absurdly large" % kind)
		_check(obj.hold_anchor_local() != Vector3.ZERO, "%s hold anchor differs from root" % kind)
		_check(_profile_matches_visible_hold(kind, obj.grip_contact_local()), "%s GripContact matches visible grip intent" % kind)
		var color_before := _mesh_color(obj)
		for _i in 5:
			await physics_frame
		_check(hand.is_carrying(), "%s remains held across physics frames" % kind)
		_check(obj.is_held == true, "%s owner state remains held" % kind)
		var grip_world: Vector3 = visual.grip_socket_world()
		var grip_dist: float = obj.grip_contact_point().distance_to(grip_world)
		_check(grip_dist < 0.06, "%s GripContact aligns to hand grip contact" % kind)
		_check(obj.global_position.distance_to(grip_world) > 0.28, "%s root remains visibly offset from hand contact" % kind)
		_check(obj.global_position.y < grip_world.y - 0.18, "%s body hangs below grip contact instead of storing in palm" % kind)
		_check(_mesh_color(obj) == color_before, "%s held state does not recolor base material" % kind)
		debug = hand.get_debug()
		_check(Vector3(debug.get("grip_point", Vector3.ZERO)).distance_to(visual.grip_socket_world()) < 0.01,
			"%s diagnostics report grip socket position" % kind)
		_check(Vector3(debug.get("held_position", Vector3.ZERO)).distance_to(obj.global_position) < 0.01,
			"%s diagnostics report held object position" % kind)
		_check(Vector3(debug.get("grip_contact", Vector3.ZERO)).distance_to(obj.grip_contact_point()) < 0.01,
			"%s diagnostics report object grip contact position" % kind)
		_check(float(debug.get("hold_distance", 99.0)) < 0.06, "%s diagnostics report small grip-contact distance" % kind)
		_check(hand.hold_debug_visible_for_test() == false, "%s F3 grip markers stay hidden while diagnostics are off" % kind)
		if diagnostics:
			diagnostics.visible = true
			await physics_frame
			_check(hand.hold_debug_visible_for_test() == true, "%s F3 grip markers appear while diagnostics are on" % kind)
			diagnostics.visible = false
			await physics_frame
			_check(hand.hold_debug_visible_for_test() == false, "%s F3 grip markers hide again when diagnostics turn off" % kind)
		hand.simulate_release_for_test(Vector3.ZERO, true)
		for _i in 2:
			await physics_frame
		_check(obj.last_release_mode == "drop", "%s gentle release records drop" % kind)
		_check(obj.recent_gentle_release == true, "%s gentle release flag stays true" % kind)
		_check(hand.is_carrying() == false, "%s gentle release clears hand state" % kind)
		_check(bool(hand.get_debug().get("grip_cup_visible", true)) == false, "%s contact grip geometry hides after release" % kind)
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
	_check(absf(float(rig.control_scale) - 1.0) < 0.001, "carrying does not slow camera controls")
	var before: Dictionary = rig.save_state()
	rig.pan_screen_delta(Vector2(36.0, -28.0))
	rig.pan_by(Vector3(3.0, 0.0, -2.5))
	rig.simulate_orbit_drag(Vector2(42.0, -18.0))
	var zoom_before: Dictionary = rig.save_state()
	rig.simulate_zoom_step_for_test(-rig.scroll_zoom_step_for_test())
	for _i in 6:
		await physics_frame
	var after: Dictionary = rig.save_state()
	_check(before.pos != after.pos, "camera pan changes rig position")
	_check(absf(float(before.yaw) - float(after.yaw)) > 0.001, "camera orbit changes yaw")
	_check(absf(float(before.pitch) - float(after.pitch)) > 0.001, "camera orbit changes pitch")
	_check(absf(float(zoom_before.dist) - float(after.dist)) > 0.001, "camera scroll-step zoom changes distance target")
	_check(hand.is_carrying(), "camera motion does not drop held object")
	_check(rock.is_held == true, "camera motion does not corrupt held object state")
	_check(rock.grip_contact_point().distance_to(hand.get_node("HandVisual").grip_socket_world()) < 0.08,
		"camera movement does not detach held GripContact")
	var click_before: Dictionary = rig.save_state()
	var left_press := InputEventMouseButton.new()
	left_press.button_index = MOUSE_BUTTON_LEFT
	left_press.pressed = true
	rig._input(left_press)
	var left_release := InputEventMouseButton.new()
	left_release.button_index = MOUSE_BUTTON_LEFT
	left_release.pressed = false
	rig._input(left_release)
	var right_press := InputEventMouseButton.new()
	right_press.button_index = MOUSE_BUTTON_RIGHT
	right_press.pressed = true
	rig._input(right_press)
	var right_release := InputEventMouseButton.new()
	right_release.button_index = MOUSE_BUTTON_RIGHT
	right_release.pressed = false
	rig._input(right_release)
	var click_after: Dictionary = rig.save_state()
	_check(absf(float(click_before.dist) - float(click_after.dist)) < 0.001, "plain mouse button clicks do not zoom")
	var fallback_press := InputEventMouseButton.new()
	fallback_press.button_index = MOUSE_BUTTON_LEFT
	fallback_press.pressed = true
	fallback_press.shift_pressed = true
	rig._input(fallback_press)
	_check(rig.is_orbiting(), "shift + left orbit fallback activates")
	var fallback_release := InputEventMouseButton.new()
	fallback_release.button_index = MOUSE_BUTTON_LEFT
	fallback_release.pressed = false
	fallback_release.shift_pressed = true
	rig._input(fallback_release)
	var alt_press := InputEventMouseButton.new()
	alt_press.button_index = MOUSE_BUTTON_LEFT
	alt_press.pressed = true
	alt_press.alt_pressed = true
	rig._input(alt_press)
	_check(rig.is_orbiting(), "alt + left orbit fallback activates")
	var alt_release := InputEventMouseButton.new()
	alt_release.button_index = MOUSE_BUTTON_LEFT
	alt_release.pressed = false
	alt_release.alt_pressed = true
	rig._input(alt_release)
	var middle_press := InputEventMouseButton.new()
	middle_press.button_index = MOUSE_BUTTON_MIDDLE
	middle_press.pressed = true
	rig._input(middle_press)
	_check(rig.middle_button_down(), "middle mouse explicit press is tracked")
	_check(rig.orbit_source() == "middle", "middle mouse is primary orbit source")
	var middle_state: Dictionary = rig.save_state()
	var middle_release := InputEventMouseButton.new()
	middle_release.button_index = MOUSE_BUTTON_MIDDLE
	middle_release.pressed = false
	rig._input(middle_release)
	var middle_after: Dictionary = rig.save_state()
	_check(absf(float(middle_state.dist) - float(middle_after.dist)) < 0.001, "middle mouse orbit does not change zoom")
	rig.orbit_step(-0.2)
	for _i in 4:
		await physics_frame
	rig.orbit_step(0.2)
	for _i in 4:
		await physics_frame
	rig.pitch_step(0.12)
	for _i in 4:
		await physics_frame
	rig.pitch_step(-0.12)
	for _i in 4:
		await physics_frame
	var settled_a: Dictionary = rig.save_state()
	for _i in 8:
		await physics_frame
	var settled_b: Dictionary = rig.save_state()
	_check(settled_a.pos.distance_to(settled_b.pos) < 0.001, "camera has no residual pan drift after input")
	_check(absf(float(settled_a.dist) - float(settled_b.dist)) < 0.001, "camera has no residual zoom drift after input")
	rig.reset_to_safe_default()
	var reset_state: Dictionary = rig.save_state()
	_check(absf(float(reset_state.yaw)) < 0.001 and absf(float(reset_state.dist) - 26.0) < 0.01, "camera reset returns to safe default")
	hand.simulate_release_for_test(Vector3.ZERO, true)
	await physics_frame

func _assert_patch08_input_contract(hand: Node, rig: Node, main: Node) -> void:
	var rock := _find_grabbable("rock")
	_check(rock != null, "rock exists for Patch 08 input contract")
	if rock == null:
		return
	hand.clear_hover_for_test()
	var empty_before: Dictionary = rig.save_state()
	_check(hand.simulate_right_mouse_press_for_test() == false, "right mouse without hovered grabbable is a no-op")
	var empty_after: Dictionary = rig.save_state()
	_check(_camera_state_close(empty_before, empty_after), "right mouse no-hover path does not move camera")
	_check(hand.is_carrying() == false, "right mouse no-hover path does not acquire nearest object")
	hand.force_hover_for_test(rock)
	var hover_before: Dictionary = rig.save_state()
	_check(hand.simulate_right_mouse_press_for_test() == true, "right mouse grabs only the hovered grabbable")
	var hover_after: Dictionary = rig.save_state()
	_check(_camera_state_close(hover_before, hover_after), "right mouse hovered grab does not move camera")
	_check(hand.is_carrying() == true, "right mouse hovered grab starts carry")
	_check(absf(float(rig.control_scale) - 1.0) < 0.001, "right mouse carry keeps camera control scale unchanged")
	hand.simulate_release_for_test(Vector3.ZERO, true)
	await physics_frame

	var small_pan_before: Dictionary = rig.save_state()
	_check(hand.simulate_empty_left_drag_for_test(Vector2(3.0, 2.0)) == false, "plain small left drag stays below pan threshold")
	var small_pan_after: Dictionary = rig.save_state()
	_check(_camera_state_close(small_pan_before, small_pan_after), "plain small left drag does not move camera")
	var edge_pan_before: Dictionary = rig.save_state()
	_check(hand.simulate_empty_left_drag_for_test(Vector2(55.0, -42.0)) == true, "left drag beyond threshold pans with screen-space fallback")
	var edge_pan_after: Dictionary = rig.save_state()
	_check(edge_pan_before.pos.distance_to(edge_pan_after.pos) > 0.2, "screen-space left drag changes camera target")

	var middle_press := InputEventMouseButton.new()
	middle_press.button_index = MOUSE_BUTTON_MIDDLE
	middle_press.pressed = true
	rig._input(middle_press)
	_check(rig.is_orbiting(), "focus-loss setup activates middle orbit")
	_check(hand.simulate_grab(rock), "focus-loss setup can hold object")
	hand.force_hover_for_test(rock)
	main.simulate_focus_loss_for_test()
	await physics_frame
	var lost_debug: Dictionary = hand.get_debug()
	_check(main.mouse_hidden_for_play() == false, "focus loss restores visible cursor")
	_check(rig.is_orbiting() == false, "focus loss clears active orbit mode")
	_check(rig.middle_button_down() == false, "focus loss clears middle-button state")
	_check(hand.is_carrying() == false, "focus loss clears stuck right-button carry")
	_check(String(lost_debug.get("hovered", "?")) == "-", "focus loss clears stale hover")
	_check(String(lost_debug.get("input_mode", "?")) == "hover", "focus loss returns input mode to hover")
	var gain_before: Dictionary = rig.save_state()
	main.simulate_focus_gain_for_test()
	await physics_frame
	var gain_after: Dictionary = rig.save_state()
	_check(main.mouse_hidden_for_play() == true, "focus gain hides cursor when mouse is inside")
	_check(rig.is_orbiting() == false, "focus gain does not start orbit")
	_check(hand.is_carrying() == false, "focus gain does not auto-grab")
	_check(_camera_state_close(gain_before, gain_after), "focus gain resync does not move camera")

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
	_check(shrine.within_offer_range(shrine.altar_point() + Vector3(4.8, 0.0, 0.0)), "shrine offering radius is generous")
	_check(not ("PLACE" in _label_texts(shrine)), "shrine no longer exposes PLACE text")
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
	hand.simulate_arm_for_test()
	var debug_arm: Dictionary = hand.get_debug()
	_check(bool(debug_arm.get("trace_armed", false)) == true, "F3 + Space force-arm path can set armed state")
	_check(String(debug_arm.get("last_arm_source", "-")) == "DEBUG_SPACE", "debug arm records DEBUG_SPACE source")
	shrine.state = shrine.ShrineState.AWAKENED
	hand.global_position = shrine.global_position + Vector3(0.0, 1.2, 0.0)
	_check(hand.simulate_glyph_for_test("zigzag", shrine.global_position) == true, "awakened shrine teaches zigzag")
	_check(main.identity.learned_bolt == true, "zigzag teaching flips learned_bolt")
	_check(hand.simulate_glyph_for_test("zigzag", Vector3(6.0, 0.0, 6.0)) == true, "learned zigzag casts away from shrine")
	_check(hand.simulate_debug_blessing_for_test() == true, "debug blessing fallback can cast")
	shrine.state = shrine.ShrineState.DORMANT
	_check(hand.simulate_debug_awaken_shrine_for_test() == true, "debug shrine fallback awakens shrine")
	_check(hand.simulate_debug_learn_bolt_for_test() == true, "debug bolt-learn fallback succeeds")
	_check(hand.simulate_debug_bolt_for_test() == true, "debug bolt-cast fallback succeeds")

func _assert_temple_and_diagnostics_contract(main: Node, diagnostics: CanvasLayer, shrine: Node, trace: Node) -> void:
	var hand: Node = main.get_node("DivineHand")
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
	_check(text.contains("pan active:"), "diagnostics expose pan state")
	_check(text.contains("input mode:"), "diagnostics expose input mode")
	_check(text.contains("hand grip contact:"), "diagnostics expose hand grip contact position")
	_check(text.contains("object grip contact:"), "diagnostics expose object grip contact position")
	_check(text.contains("held object position:"), "diagnostics expose held object position")
	_check(text.contains("hold profile:"), "diagnostics expose active hold profile")
	_check(text.contains("grip-contact dist"), "diagnostics expose grip-contact distance")
	_check(text.contains("hold debug markers active:"), "diagnostics expose hold-debug marker state")
	_check(text.contains("bolt learned:"), "diagnostics expose bolt learned state")
	var label_texts := _label_texts(temple)
	_check("SYMBOL" in label_texts, "temple exposes SYMBOL label")
	_check("GLYPHS" in label_texts, "temple exposes GLYPHS label")
	_check("EXIT" in label_texts, "temple exposes EXIT label")
	_check(temple.get_node_or_null("SymbolChamber") != null, "temple exposes physical symbol chamber node")
	_check(temple.get_node_or_null("GlyphChamber") != null, "temple exposes physical glyph chamber node")
	_check(temple.get_node_or_null("ExitChamber") != null, "temple exposes physical exit chamber node")
	_check(temple.get_node_or_null("GlyphChamber/CircleGlyphPedestal/CircleGlyph") != null, "temple circle glyph is pedestal-bound")
	_check(temple.get_node_or_null("GlyphChamber/CircleGlyphPedestal/CircleGlyphLabel") != null, "temple circle glyph is labeled")
	_check(trace.active_mote_count() <= 28, "gesture trace active motes stay bounded")
	_check(hand.hold_debug_visible_for_test() == false, "hold debug markers are hidden during temple diagnostics by default")
	_check(main.mouse_hidden_for_play() == true, "temple flow does not restore cursor policy")
	_check(_temple_labels_face_camera(temple), "temple labels are camera-visible from center")
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

func _mesh_color(node: Node) -> Color:
	for child in node.get_children():
		if child is MeshInstance3D and child.material_override is StandardMaterial3D:
			return child.material_override.albedo_color
	return Color.BLACK

func _camera_state_close(a: Dictionary, b: Dictionary) -> bool:
	return a.pos.distance_to(b.pos) < 0.001 \
		and absf(float(a.yaw) - float(b.yaw)) < 0.001 \
		and absf(float(a.pitch) - float(b.pitch)) < 0.001 \
		and absf(float(a.dist) - float(b.dist)) < 0.001

func _profile_matches_visible_hold(kind: String, offset: Vector3) -> bool:
	match kind:
		"rock":
			return offset.y >= 0.45 and offset.y <= 0.68 and offset.z < -0.1
		"villager":
			return offset.y >= 0.7 and offset.y <= 0.9 and offset.z <= 0.0
		"offering":
			return offset.y >= 0.82 and offset.y <= 1.02 and offset.z <= 0.0
		"tree":
			# Low on the trunk, not mid-trunk: a mid-trunk grip put the hand
			# inside the canopy. See the canopy-clearance check above.
			return offset.y >= 0.32 and offset.y <= 0.58 and offset.z <= 0.0
	return false

func _label_texts(node: Node) -> Array[String]:
	var out: Array[String] = []
	for child in node.get_children():
		if child is Label3D:
			out.append(child.text)
	return out

func _temple_labels_face_camera(node: Node) -> bool:
	for child in node.get_children():
		if child is Label3D and child.text in ["SYMBOL", "GLYPHS", "EXIT"]:
			if child.position.z > -3.5:
				return false
	return true

func _check(cond: bool, label: String) -> void:
	if cond:
		print("  ok: " + label)
	else:
		_failures.append(label)
		print("  FAIL: " + label)
