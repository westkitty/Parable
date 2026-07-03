extends CanvasLayer
## Dev-only diagnostics. F3 toggles. Off by default. Deliberately ugly
## monospace so nobody is ever tempted to ship it as gameplay HUD.

var _label: Label

func _ready() -> void:
	add_to_group("diagnostics")
	visible = false
	_label = Label.new()
	_label.position = Vector2(12, 12)
	_label.add_theme_font_size_override("font_size", 13)
	_label.add_theme_color_override("font_color", Color(0.6, 1.0, 0.6))
	_label.add_theme_color_override("font_outline_color", Color.BLACK)
	_label.add_theme_constant_override("outline_size", 4)
	add_child(_label)

func _process(_delta: float) -> void:
	if Input.is_action_just_pressed("toggle_diagnostics"):
		visible = not visible
	if not visible:
		return
	_label.text = "\n".join(snapshot_lines())

func snapshot_lines() -> Array[String]:
	var tree := get_tree()
	var hand := tree.get_first_node_in_group("divine_hand")
	var rig := tree.get_first_node_in_group("camera_rig")
	var world := tree.get_first_node_in_group("world")
	var shrine := tree.get_first_node_in_group("shrine")
	var lines: Array[String] = ["[DEV DIAGNOSTICS — F3 to hide — not gameplay UI]"]
	if world:
		lines.append("scene: %s" % world.scene_label())
		lines.append("temple chamber: %s" % world.current_temple_chamber())
		lines.append("cursor policy: %s / %s" % [world.cursor_focus_state(), world.cursor_policy_state()])
	if hand:
		var d: Dictionary = hand.get_debug()
		lines.append("input state: %s" % d.get("state", "?"))
		lines.append("hovered: %s" % d.get("hovered", "-"))
		lines.append("held: %s (%s)" % [d.get("held", "-"), d.get("held_mass", "-")])
		lines.append("right mouse down: %s" % str(d.get("right_mouse_down", false)))
		lines.append("hand velocity: %.2f m/s" % d.get("hand_speed", 0.0))
		lines.append("last throw: %.2f raw -> %.2f clamped" % [d.get("last_throw_raw", 0.0), d.get("last_throw_final", 0.0)])
		lines.append("last throw vec: %s" % str(d.get("last_throw_vector", Vector3.ZERO)))
		lines.append("last release mode: %s" % d.get("last_release_mode", "-"))
		lines.append("last release speed: %.2f" % d.get("last_release_speed", 0.0))
		lines.append("gesture mode: %s" % str(d.get("gesture_mode", false)))
		lines.append("miracle armed: %s timer %.2f" % [str(d.get("trace_armed", false)), d.get("armed_timer", 0.0)])
		lines.append("debug arm: %s source %s" % [str(d.get("debug_force_arm", false)), d.get("last_arm_source", "-")])
		lines.append("cast result: %s" % d.get("cast_result", "-"))
		lines.append("trace: len %.1f loops %.2f" % [d.get("trace_length", 0.0), d.get("glyph_loops", 0.0)])
		lines.append("last glyph: %s (rot %.2f, closure %.2f, reversals %d, radius %.2f)" % [
			d.get("glyph_kind", "-"), d.get("glyph_rotation", 0.0),
			d.get("glyph_closure", 0.0), d.get("glyph_reversals", 0), d.get("glyph_radius_swing", 0.0)])
		lines.append("bolt learned: %s" % str(d.get("bolt_learned", false)))
		lines.append("ray target: %s" % str(d.get("ray_target", Vector3.ZERO)))
		lines.append("hand target: %s" % str(d.get("hand_target", Vector3.ZERO)))
		lines.append("grip point: %s" % str(d.get("grip_point", Vector3.ZERO)))
		lines.append("hold offset: %s grip dist %.2f" % [str(d.get("hold_offset", Vector3.ZERO)), d.get("hold_distance", 0.0)])
		lines.append("hover anchor: %s" % str(d.get("hover_anchor", Vector3.ZERO)))
		lines.append("pan active: %s source %s" % [str(d.get("pan_active", false)), d.get("pan_source", "none")])
		lines.append("camera target: %s" % str(d.get("camera_target", Vector3.ZERO)))
	if shrine:
		lines.append("shrine awake: %s (%s)" % [str(shrine.is_awakened()), shrine.current_state_label()])
		lines.append("shrine reject: %s" % shrine.last_reject_reason())
		var nearest := INF
		for g in tree.get_nodes_in_group("grabbable"):
			if g.display_name == "offering":
				nearest = minf(nearest, g.global_position.distance_to(shrine.altar_point()))
		lines.append("nearest offering dist: %s" % ("%.2f" % nearest if nearest < INF else "-"))
	if rig:
		lines.append("camera: %s dist %.1f" % [rig.camera_mode(), rig.dist])
		lines.append("middle button: %s orbit source: %s" % [str(rig.middle_button_down()), rig.orbit_source()])
	var fps := Engine.get_frames_per_second()
	lines.append("fps: %d frame_ms %.2f" % [fps, 1000.0 / maxf(float(fps), 1.0)])
	return lines
