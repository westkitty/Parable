extends Node3D
## Static temple interior — a sacred hub, not a walking sim and not a menu.
## The god floats at the center. Click left → Symbol chamber. Click right →
## Glyph chamber. Click the door ahead → back to the world. While facing a
## side chamber, any click returns to center. No panels, no settings.

const TURN_TIME := 0.7

var active := false

var _world: Node
var _camera: Camera3D
var _yaw_target := 0.0
var _facing := "center"     # center | left | right
var _turning := false
var _symbol_slot: Node3D
var _glyph_slot: Node3D
var _candidate_slot: Node3D
var _bolt_glyph_mat: StandardMaterial3D
var _left_marker: StandardMaterial3D
var _right_marker: StandardMaterial3D
var _exit_marker: StandardMaterial3D

func _ready() -> void:
	add_to_group("temple_interior")
	_camera = $InteriorCamera
	_camera.position = Vector3(0.0, 1.6, 0.0)
	_build_chamber()

func enter(world: Node) -> void:
	_world = world
	active = true
	_facing = "center"
	rotation.y = 0.0
	_camera.rotation.y = 0.0
	_yaw_target = 0.0
	_refresh_contents()
	_camera.make_current()

func leave() -> void:
	active = false

func _unhandled_input(event: InputEvent) -> void:
	if not active or _turning:
		return
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		_handle_click(event.position)

func _handle_click(screen_pos: Vector2) -> void:
	if _facing != "center":
		_turn_to(0.0, "center")
		return
	var from := _camera.project_ray_origin(screen_pos)
	var dir := _camera.project_ray_normal(screen_pos)
	var params := PhysicsRayQueryParameters3D.create(from, from + dir * 40.0)
	params.collision_mask = 8
	params.collide_with_areas = true
	params.collide_with_bodies = false
	var hit := get_world_3d().direct_space_state.intersect_ray(params)
	if hit.is_empty():
		return
	var target: Node = hit.collider
	match target.name:
		"LeftHotspot":
			_turn_to(deg_to_rad(90.0), "left")
		"RightHotspot":
			_turn_to(deg_to_rad(-90.0), "right")
		"ExitDoor":
			if _world:
				_world.exit_temple()

func _turn_to(yaw: float, facing: String) -> void:
	_turning = true
	_facing = facing
	var tw := create_tween()
	tw.tween_property(_camera, "rotation:y", yaw, TURN_TIME) \
		.set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	tw.finished.connect(func() -> void: _turning = false)

func _refresh_contents() -> void:
	var identity := get_node_or_null("/root/GodIdentity")
	# Symbol chamber: chosen symbol enthroned, or faint candidates pre-choice.
	for c in _symbol_slot.get_children():
		c.queue_free()
	for c in _candidate_slot.get_children():
		c.queue_free()
	if identity and identity.symbol != "":
		var s := SymbolForms.build(identity.symbol, 3.0)
		s.scale = Vector3(1.6, 1.6, 1.6)
		_symbol_slot.add_child(s)
	else:
		for i in SymbolForms.IDS.size():
			var cand := SymbolForms.build(SymbolForms.IDS[i], 0.5)
			cand.scale = Vector3(0.8, 0.8, 0.8)
			cand.position = Vector3(0.0, 0.0, -1.1 + i * 1.1)
			_candidate_slot.add_child(cand)
	# Glyph chamber: circle always lit; zigzag dim until learned.
	var learned: bool = identity != null and identity.learned_bolt
	_bolt_glyph_mat.emission_energy_multiplier = 2.6 if learned else 0.18

func _build_chamber() -> void:
	var stone := StandardMaterial3D.new()
	stone.albedo_color = Color(0.32, 0.3, 0.34)
	stone.roughness = 0.9

	var floor_mesh := MeshInstance3D.new()
	var disc := CylinderMesh.new()
	disc.top_radius = 7.0
	disc.bottom_radius = 7.0
	disc.height = 0.3
	floor_mesh.mesh = disc
	floor_mesh.material_override = stone
	floor_mesh.position.y = -0.15
	add_child(floor_mesh)

	var wall := MeshInstance3D.new()
	var tube := CylinderMesh.new()
	tube.top_radius = 7.2
	tube.bottom_radius = 7.2
	tube.height = 6.0
	tube.cap_top = false
	tube.cap_bottom = false
	wall.mesh = tube
	var wall_mat := StandardMaterial3D.new()
	wall_mat.albedo_color = Color(0.24, 0.22, 0.28)
	wall_mat.roughness = 1.0
	wall_mat.cull_mode = BaseMaterial3D.CULL_FRONT   # visible from inside
	wall.material_override = wall_mat
	wall.position.y = 3.0
	add_child(wall)

	var glow := OmniLight3D.new()
	glow.light_color = Color(1.0, 0.85, 0.6)
	glow.light_energy = 2.2
	glow.omni_range = 16.0
	glow.position = Vector3(0.0, 4.0, 0.0)
	add_child(glow)

	# --- Center (forward, -Z): the exit door back to the world.
	var door := MeshInstance3D.new()
	var door_mesh := BoxMesh.new()
	door_mesh.size = Vector3(1.8, 3.0, 0.25)
	door.mesh = door_mesh
	var door_mat := StandardMaterial3D.new()
	door_mat.albedo_color = Color(0.1, 0.12, 0.2)
	door_mat.emission_enabled = true
	door_mat.emission = Color(0.5, 0.8, 1.0)
	door_mat.emission_energy_multiplier = 0.8
	door.material_override = door_mat
	_exit_marker = door_mat
	door.position = Vector3(0.0, 1.6, -6.6)
	add_child(door)
	_hotspot("ExitDoor", Vector3(0.0, 1.6, -6.5), Vector3(2.2, 3.4, 1.0))

	# --- Left chamber (+X side when facing -Z → yaw +90 looks toward -X).
	# Symbol / Identity alcove sits at -X.
	var sym_pedestal := MeshInstance3D.new()
	var ped := CylinderMesh.new()
	ped.top_radius = 0.5
	ped.bottom_radius = 0.7
	ped.height = 1.0
	sym_pedestal.mesh = ped
	sym_pedestal.material_override = stone
	sym_pedestal.position = Vector3(-5.6, 0.5, 0.0)
	add_child(sym_pedestal)
	_left_marker = _marker(Vector3(-6.4, 2.5, 0.0), "IDENTITY")
	_symbol_slot = Node3D.new()
	_symbol_slot.position = Vector3(-5.6, 2.0, 0.0)
	_symbol_slot.rotation_degrees.y = 90.0
	add_child(_symbol_slot)
	_candidate_slot = Node3D.new()
	_candidate_slot.position = Vector3(-5.6, 1.8, 0.0)
	_candidate_slot.rotation_degrees.y = 90.0
	add_child(_candidate_slot)
	_hotspot("LeftHotspot", Vector3(-5.4, 1.6, 0.0), Vector3(1.6, 3.6, 3.6))

	# --- Right chamber (-X side → yaw -90 looks toward +X).
	# Miracle / Glyph alcove: circle glyph lit, zigzag dim until learned.
	var circle_slot := SymbolForms.build("ring", 2.6)
	circle_slot.position = Vector3(5.7, 2.2, -0.8)
	circle_slot.rotation_degrees.y = -90.0
	add_child(circle_slot)

	_bolt_glyph_mat = StandardMaterial3D.new()
	_bolt_glyph_mat.albedo_color = Color(0.9, 0.75, 0.4)
	_bolt_glyph_mat.emission_enabled = true
	_bolt_glyph_mat.emission = Color(1.0, 0.72, 0.25)
	_bolt_glyph_mat.emission_energy_multiplier = 0.18
	_right_marker = _marker(Vector3(6.4, 2.5, 0.0), "MIRACLE")
	var zig_points := [
		Vector2(-0.25, 0.6), Vector2(0.25, 0.25), Vector2(-0.25, -0.1),
		Vector2(0.25, -0.45), Vector2(-0.25, -0.8),
	]
	_glyph_slot = Node3D.new()
	_glyph_slot.position = Vector3(5.7, 2.3, 0.9)
	_glyph_slot.rotation_degrees.y = -90.0
	add_child(_glyph_slot)
	for i in range(zig_points.size() - 1):
		var a: Vector2 = zig_points[i]
		var b: Vector2 = zig_points[i + 1]
		var mid := (a + b) * 0.5
		var seg := MeshInstance3D.new()
		var box := BoxMesh.new()
		box.size = Vector3(a.distance_to(b), 0.08, 0.05)
		seg.mesh = box
		seg.material_override = _bolt_glyph_mat
		seg.position = Vector3(mid.x, mid.y, 0.0)
		seg.rotation.z = (b - a).angle()
		_glyph_slot.add_child(seg)
	_hotspot("RightHotspot", Vector3(5.4, 1.6, 0.0), Vector3(1.6, 3.6, 3.6))

func _marker(pos: Vector3, text: String) -> StandardMaterial3D:
	var panel := MeshInstance3D.new()
	var quad := QuadMesh.new()
	quad.size = Vector2(2.1, 1.0)
	panel.mesh = quad
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.18, 0.16, 0.24, 0.95)
	mat.emission_enabled = true
	mat.emission = Color(0.95, 0.82, 0.42)
	mat.emission_energy_multiplier = 1.2
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	panel.material_override = mat
	panel.position = pos
	panel.rotation_degrees.y = -90.0 if pos.x > 0.0 else 90.0
	add_child(panel)
	var label := Label3D.new()
	label.text = text
	label.font_size = 72
	label.pixel_size = 0.01
	label.modulate = Color(1.0, 0.95, 0.75)
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	label.position = pos + Vector3(0.0, 0.0, 0.01)
	add_child(label)
	return mat

func _hotspot(hname: String, pos: Vector3, size: Vector3) -> void:
	var area := Area3D.new()
	area.name = hname
	area.collision_layer = 8
	area.collision_mask = 0
	area.monitoring = false
	var col := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = size
	col.shape = shape
	area.add_child(col)
	area.position = pos
	add_child(area)
