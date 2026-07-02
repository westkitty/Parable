class_name SymbolForms
extends RefCounted
## Builds the three placeholder god-symbol meshes. Used by the world
## (choice ritual, stone painting) and the temple Symbol chamber.

const IDS: Array[String] = ["ring", "triad", "wave"]

static func build(id: String, energy: float = 2.0) -> Node3D:
	var root := Node3D.new()
	root.name = "Symbol_" + id
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(1.0, 0.85, 0.45)
	mat.emission_enabled = true
	mat.emission = Color(1.0, 0.78, 0.32)
	mat.emission_energy_multiplier = energy
	match id:
		"ring":
			var torus := TorusMesh.new()
			torus.inner_radius = 0.34
			torus.outer_radius = 0.46
			var ring := MeshInstance3D.new()
			ring.mesh = torus
			ring.material_override = mat
			ring.rotation_degrees.x = 90.0
			root.add_child(ring)
			var dot := MeshInstance3D.new()
			var s := SphereMesh.new()
			s.radius = 0.09
			s.height = 0.18
			dot.mesh = s
			dot.material_override = mat
			root.add_child(dot)
		"triad":
			for k in 3:
				var bar := MeshInstance3D.new()
				var b := BoxMesh.new()
				b.size = Vector3(0.62, 0.07, 0.07)
				bar.mesh = b
				bar.material_override = mat
				var ang := deg_to_rad(k * 120.0 + 90.0)
				bar.position = Vector3(cos(ang), sin(ang), 0.0) * 0.18
				bar.rotation_degrees.z = k * 120.0 + 30.0
				root.add_child(bar)
		"wave":
			for k in 3:
				var seg := MeshInstance3D.new()
				var b2 := BoxMesh.new()
				b2.size = Vector3(0.34, 0.07, 0.07)
				seg.mesh = b2
				seg.material_override = mat
				seg.position = Vector3(-0.28 + k * 0.28, 0.14 if k % 2 == 0 else -0.14, 0.0)
				seg.rotation_degrees.z = 38.0 if k % 2 == 0 else -38.0
				root.add_child(seg)
		_:
			var fallback := MeshInstance3D.new()
			var box := BoxMesh.new()
			box.size = Vector3(0.4, 0.4, 0.08)
			fallback.mesh = box
			fallback.material_override = mat
			root.add_child(fallback)
	return root
