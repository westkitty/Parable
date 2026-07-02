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
			var tri_points := [Vector2(0.0, 0.42), Vector2(-0.38, -0.24), Vector2(0.38, -0.24)]
			for k in 3:
				var a: Vector2 = tri_points[k]
				var b: Vector2 = tri_points[(k + 1) % 3]
				var edge := MeshInstance3D.new()
				var edge_mesh := BoxMesh.new()
				edge_mesh.size = Vector3(a.distance_to(b), 0.08, 0.08)
				edge.mesh = edge_mesh
				edge.material_override = mat
				edge.position = Vector3((a.x + b.x) * 0.5, (a.y + b.y) * 0.5, 0.0)
				edge.rotation_degrees.z = rad_to_deg((b - a).angle())
				root.add_child(edge)
		"wave":
			for k in 3:
				var seg := MeshInstance3D.new()
				var b2 := BoxMesh.new()
				b2.size = Vector3(0.56, 0.08, 0.08)
				seg.mesh = b2
				seg.material_override = mat
				seg.position = Vector3(0.0, 0.3 - k * 0.3, 0.0)
				root.add_child(seg)
		_:
			var fallback := MeshInstance3D.new()
			var box := BoxMesh.new()
			box.size = Vector3(0.4, 0.4, 0.08)
			fallback.mesh = box
			fallback.material_override = mat
			root.add_child(fallback)
	return root
