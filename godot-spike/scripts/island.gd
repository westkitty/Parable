extends StaticBody3D
## Island — one gently sculpted mound with collision. The height function is
## analytic so villagers and placement code can query ground height without
## raycasts. No procedural-generation systems; this is a stage, not a world.

const LAND_RADIUS := 24.0
const GRID_EXTENT := 27.0
const GRID_STEPS := 44

func _ready() -> void:
	add_to_group("island")
	collision_layer = 1
	collision_mask = 0
	_build_terrain()
	_build_water()

func height_at(x: float, z: float) -> float:
	var r := Vector2(x, z).length()
	var m := clampf(1.0 - r / LAND_RADIUS, 0.0, 1.0)
	var s := m * m * (3.0 - 2.0 * m)
	var h := -0.45 + 7.6 * s
	h += (sin(x * 0.31) * cos(z * 0.22) * 0.45 + sin(x * 0.09 + z * 0.14) * 0.72) * s
	return h

func ground_point(x: float, z: float) -> Vector3:
	return Vector3(x, height_at(x, z), z)

func _build_terrain() -> void:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var step := (GRID_EXTENT * 2.0) / float(GRID_STEPS)
	for iz in GRID_STEPS:
		for ix in GRID_STEPS:
			var x0 := -GRID_EXTENT + ix * step
			var z0 := -GRID_EXTENT + iz * step
			var x1 := x0 + step
			var z1 := z0 + step
			var p00 := Vector3(x0, height_at(x0, z0), z0)
			var p10 := Vector3(x1, height_at(x1, z0), z0)
			var p01 := Vector3(x0, height_at(x0, z1), z1)
			var p11 := Vector3(x1, height_at(x1, z1), z1)
			_tri(st, p00, p11, p10)
			_tri(st, p00, p01, p11)
	st.generate_normals()
	var mesh := st.commit()
	var mi := MeshInstance3D.new()
	mi.name = "TerrainMesh"
	mi.mesh = mesh
	var mat := StandardMaterial3D.new()
	mat.vertex_color_use_as_albedo = true
	mat.roughness = 0.95
	mi.material_override = mat
	add_child(mi)
	var col := CollisionShape3D.new()
	col.shape = mesh.create_trimesh_shape()
	add_child(col)

func _tri(st: SurfaceTool, a: Vector3, b: Vector3, c: Vector3) -> void:
	for p in [a, b, c]:
		st.set_color(_ground_color(p.y))
		st.add_vertex(p)

func _ground_color(h: float) -> Color:
	if h < 0.75:
		return Color(0.88, 0.8, 0.56)   # sand
	if h < 4.7:
		return Color(0.26, 0.65, 0.24)  # grass
	return Color(0.52, 0.52, 0.5)      # rocky top

func _build_water() -> void:
	var water := MeshInstance3D.new()
	water.name = "Water"
	var disc := CylinderMesh.new()
	disc.top_radius = 70.0
	disc.bottom_radius = 70.0
	disc.height = 0.1
	water.mesh = disc
	water.position = Vector3(0.0, -0.38, 0.0)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.1, 0.4, 0.68, 0.72)
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.roughness = 0.08
	mat.metallic = 0.12
	water.material_override = mat
	add_child(water)
