extends Grabbable
## Rock — the baseline satisfying throwable. Medium mass, honest thud.

func _configure() -> void:
	mass_category = MassCategory.MEDIUM
	mass = 40.0
	display_name = "rock"
	hold_offset = Vector3(0.0, -0.75, 0.0)

func _build_body() -> void:
	var sph := SphereMesh.new()
	var s := randf_range(0.4, 0.62)
	sph.radius = s
	sph.height = s * 1.7
	_add_mesh(sph, Color(0.5, 0.5, 0.48))
	var shape := SphereShape3D.new()
	shape.radius = s
	_add_collider(shape)

func _on_landed(impact: float) -> void:
	if impact <= HARD_LANDING_SPEED:
		return
	var dust := CPUParticles3D.new()
	dust.one_shot = true
	dust.amount = 24
	dust.lifetime = 0.8
	dust.emitting = true
	dust.direction = Vector3.UP
	dust.spread = 60.0
	dust.initial_velocity_min = 1.5
	dust.initial_velocity_max = 3.5
	dust.gravity = Vector3(0.0, -6.0, 0.0)
	var mesh := SphereMesh.new()
	mesh.radius = 0.06
	mesh.height = 0.12
	dust.mesh = mesh
	get_parent().add_child(dust)
	dust.global_position = global_position
	get_tree().create_timer(1.2).timeout.connect(dust.queue_free)
