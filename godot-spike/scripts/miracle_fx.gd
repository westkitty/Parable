class_name MiracleFx
extends RefCounted
## Placeholder miracle effects. Spectacle stubs, not designed miracles.

static func blessing(parent: Node, pos: Vector3) -> void:
	var root := Node3D.new()
	parent.add_child(root)
	root.global_position = pos

	var ring := MeshInstance3D.new()
	var torus := TorusMesh.new()
	torus.inner_radius = 0.8
	torus.outer_radius = 1.0
	ring.mesh = torus
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(1.0, 0.95, 0.7, 0.9)
	mat.emission_enabled = true
	mat.emission = Color(1.0, 0.9, 0.5)
	mat.emission_energy_multiplier = 2.5
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	ring.material_override = mat
	ring.position.y = 0.3
	root.add_child(ring)

	var motes := CPUParticles3D.new()
	motes.amount = 60
	motes.lifetime = 2.2
	motes.emitting = true
	motes.emission_shape = CPUParticles3D.EMISSION_SHAPE_SPHERE
	motes.emission_sphere_radius = 3.0
	motes.direction = Vector3.DOWN
	motes.spread = 20.0
	motes.initial_velocity_min = 0.4
	motes.initial_velocity_max = 1.2
	motes.gravity = Vector3(0.0, -0.8, 0.0)
	var mote_mesh := SphereMesh.new()
	mote_mesh.radius = 0.05
	mote_mesh.height = 0.1
	motes.mesh = mote_mesh
	motes.position.y = 3.0
	root.add_child(motes)

	var light := OmniLight3D.new()
	light.light_color = Color(1.0, 0.9, 0.6)
	light.light_energy = 3.0
	light.omni_range = 9.0
	light.position.y = 2.0
	root.add_child(light)

	var tw := root.create_tween().set_parallel(true)
	tw.tween_property(ring, "scale", Vector3(4.0, 1.0, 4.0), 2.0) \
		.set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	tw.tween_property(mat, "albedo_color:a", 0.0, 2.2)
	tw.tween_property(light, "light_energy", 0.0, 3.0)
	parent.get_tree().create_timer(4.5).timeout.connect(root.queue_free)

static func bolt(parent: Node, pos: Vector3) -> void:
	var root := Node3D.new()
	parent.add_child(root)
	root.global_position = pos

	var shaft := MeshInstance3D.new()
	var cyl := CylinderMesh.new()
	cyl.top_radius = 0.12
	cyl.bottom_radius = 0.28
	cyl.height = 26.0
	shaft.mesh = cyl
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(1.0, 0.98, 0.85, 1.0)
	mat.emission_enabled = true
	mat.emission = Color(1.0, 0.95, 0.7)
	mat.emission_energy_multiplier = 8.0
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	shaft.material_override = mat
	shaft.position.y = 13.0
	root.add_child(shaft)

	var light := OmniLight3D.new()
	light.light_color = Color(1.0, 0.95, 0.8)
	light.light_energy = 8.0
	light.omni_range = 14.0
	light.position.y = 1.5
	root.add_child(light)

	# Persistent scorch — consequence stays in the world.
	var scorch := MeshInstance3D.new()
	var disc := CylinderMesh.new()
	disc.top_radius = 1.4
	disc.bottom_radius = 1.4
	disc.height = 0.06
	scorch.mesh = disc
	var smat := StandardMaterial3D.new()
	smat.albedo_color = Color(0.12, 0.09, 0.07)
	smat.roughness = 1.0
	scorch.material_override = smat
	parent.add_child(scorch)
	scorch.global_position = pos + Vector3(0.0, 0.04, 0.0)

	var smoke := CPUParticles3D.new()
	smoke.amount = 30
	smoke.lifetime = 1.6
	smoke.one_shot = true
	smoke.emitting = true
	smoke.direction = Vector3.UP
	smoke.spread = 35.0
	smoke.initial_velocity_min = 1.0
	smoke.initial_velocity_max = 3.0
	smoke.gravity = Vector3(0.0, 0.5, 0.0)
	var smesh := SphereMesh.new()
	smesh.radius = 0.12
	smesh.height = 0.24
	smoke.mesh = smesh
	root.add_child(smoke)

	var tw := root.create_tween().set_parallel(true)
	tw.tween_property(mat, "albedo_color:a", 0.0, 0.5).set_delay(0.15)
	tw.tween_property(light, "light_energy", 0.0, 0.8)
	parent.get_tree().create_timer(2.5).timeout.connect(root.queue_free)
