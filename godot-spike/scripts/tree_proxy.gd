extends Grabbable
## Tree — heavy, anchored until first grabbed, uproots with a resistance pop.

var _uprooted := false

func _configure() -> void:
	mass_category = MassCategory.HEAVY
	mass = 120.0
	display_name = "tree"
	hold_offset = Vector3(0.0, -1.15, -0.08)
	pick_anchor_offset = Vector3(0.0, 1.35, 0.0)
	hover_screen_radius = 72.0
	ground_clearance = 1.28
	start_frozen = true

func _build_body() -> void:
	var trunk := CylinderMesh.new()
	trunk.top_radius = 0.14
	trunk.bottom_radius = 0.22
	trunk.height = 1.8
	_add_mesh(trunk, Color(0.36, 0.25, 0.15), Vector3(0.0, 0.9, 0.0))
	var crown := SphereMesh.new()
	crown.radius = 0.85
	crown.height = 1.7
	_add_mesh(crown, Color(0.16, 0.36, 0.16), Vector3(0.0, 2.2, 0.0))
	var shape := CylinderShape3D.new()
	shape.radius = 0.3
	shape.height = 2.4
	_add_collider(shape, Vector3(0.0, 1.2, 0.0))

func _on_grabbed() -> void:
	if _uprooted:
		return
	_uprooted = true
	var dirt := CPUParticles3D.new()
	dirt.one_shot = true
	dirt.amount = 18
	dirt.lifetime = 0.7
	dirt.emitting = true
	dirt.direction = Vector3.UP
	dirt.spread = 75.0
	dirt.initial_velocity_min = 1.0
	dirt.initial_velocity_max = 2.5
	dirt.gravity = Vector3(0.0, -8.0, 0.0)
	var mesh := BoxMesh.new()
	mesh.size = Vector3(0.1, 0.1, 0.1)
	dirt.mesh = mesh
	get_parent().add_child(dirt)
	dirt.global_position = global_position
	get_tree().create_timer(1.0).timeout.connect(dirt.queue_free)
