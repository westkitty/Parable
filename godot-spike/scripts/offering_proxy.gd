extends Grabbable
## Shrine offering — a small sacred totem. Reads different from mundane
## objects (steady teal glow, reverent minimal sway). Placed gently near the
## shrine, it awakens the dormant glyph. hand_input performs the snap check.

var consumed := false

func _configure() -> void:
	mass_category = MassCategory.LIGHT
	mass = 3.0
	display_name = "offering"
	hold_offset = Vector3(0.0, 0.08, 0.0)
	ground_clearance = 0.62

func _build_body() -> void:
	var base := BoxMesh.new()
	base.size = Vector3(0.56, 0.8, 0.56)
	var mi := _add_mesh(base, Color(0.22, 0.72, 0.68), Vector3(0.0, 0.4, 0.0), false)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.22, 0.72, 0.68)
	mat.emission_enabled = true
	mat.emission = Color(0.3, 1.0, 0.9)
	mat.emission_energy_multiplier = 2.0
	mi.material_override = mat
	_hover_mats.append(mat)
	var cap := SphereMesh.new()
	cap.radius = 0.26
	cap.height = 0.52
	var top := _add_mesh(cap, Color(0.45, 0.95, 0.86), Vector3(0.0, 0.95, 0.0), false)
	top.material_override = mat
	var halo := MeshInstance3D.new()
	var torus := TorusMesh.new()
	torus.inner_radius = 0.2
	torus.outer_radius = 0.33
	halo.mesh = torus
	halo.material_override = mat
	halo.position = Vector3(0.0, 0.78, 0.0)
	add_child(halo)
	var shape := BoxShape3D.new()
	shape.size = Vector3(0.6, 1.2, 0.6)
	_add_collider(shape, Vector3(0.0, 0.58, 0.0))

func set_hover(on: bool) -> void:
	for m in _hover_mats:
		m.emission_energy_multiplier = 3.4 if on else 2.0

func consume_at(altar_point: Vector3) -> void:
	consumed = true
	is_held = false
	freeze_mode = RigidBody3D.FREEZE_MODE_KINEMATIC
	freeze = true
	remove_from_group("grabbable")
	var tw := create_tween()
	tw.tween_property(self, "global_position", altar_point, 0.5) \
		.set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
