extends Grabbable
## Shrine offering — a small sacred totem. Reads different from mundane
## objects (steady teal glow, reverent minimal sway). Placed gently near the
## shrine, it awakens the dormant glyph. hand_input performs the snap check.

var consumed := false

func _configure() -> void:
	mass_category = MassCategory.LIGHT
	mass = 3.0
	display_name = "offering"
	hold_offset = Vector3(0.0, -0.55, 0.0)

func _build_body() -> void:
	var base := BoxMesh.new()
	base.size = Vector3(0.34, 0.5, 0.34)
	var mi := _add_mesh(base, Color(0.3, 0.55, 0.55), Vector3(0.0, 0.25, 0.0), false)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.3, 0.55, 0.55)
	mat.emission_enabled = true
	mat.emission = Color(0.35, 0.9, 0.85)
	mat.emission_energy_multiplier = 0.7
	mi.material_override = mat
	_hover_mats.append(mat)
	var cap := SphereMesh.new()
	cap.radius = 0.14
	cap.height = 0.28
	var top := _add_mesh(cap, Color(0.4, 0.75, 0.7), Vector3(0.0, 0.6, 0.0), false)
	top.material_override = mat
	var shape := BoxShape3D.new()
	shape.size = Vector3(0.36, 0.75, 0.36)
	_add_collider(shape, Vector3(0.0, 0.37, 0.0))

func set_hover(on: bool) -> void:
	for m in _hover_mats:
		m.emission_energy_multiplier = 1.8 if on else 0.7

func consume_at(altar_point: Vector3) -> void:
	consumed = true
	is_held = false
	freeze_mode = RigidBody3D.FREEZE_MODE_KINEMATIC
	freeze = true
	remove_from_group("grabbable")
	var tw := create_tween()
	tw.tween_property(self, "global_position", altar_point, 0.5) \
		.set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
