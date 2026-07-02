extends Node3D
## The visible divine hand body. Palm + five digits built from primitives,
## posed by name. Not a cursor skin: it tilts, curls, and reaches.

var _fingers: Array[Node3D] = []   # pivot nodes (4 fingers)
var _thumb: Node3D
var _palm: MeshInstance3D
var _skin_mats: Array[StandardMaterial3D] = []
var _aura: OmniLight3D
var _pose := "open"
var _curl_target := 0.15
var _thumb_target := 0.2
var _tilt_target := 0.0
var _spread_target := 1.0

func _ready() -> void:
	var skin := StandardMaterial3D.new()
	skin.albedo_color = Color(0.87, 0.72, 0.58)
	skin.roughness = 0.7
	skin.emission_enabled = true
	skin.emission = Color(1.0, 0.85, 0.55)
	skin.emission_energy_multiplier = 0.12
	_skin_mats.append(skin)

	_palm = MeshInstance3D.new()
	var palm_mesh := BoxMesh.new()
	palm_mesh.size = Vector3(0.62, 0.16, 0.7)
	_palm.mesh = palm_mesh
	_palm.material_override = skin
	add_child(_palm)

	for i in 4:
		var pivot := Node3D.new()
		pivot.position = Vector3(-0.23 + i * 0.152, 0.0, -0.36)
		add_child(pivot)
		var seg := MeshInstance3D.new()
		var seg_mesh := CapsuleMesh.new()
		seg_mesh.radius = 0.055
		seg_mesh.height = 0.44
		seg.mesh = seg_mesh
		seg.rotation_degrees.x = 90.0
		seg.position = Vector3(0.0, 0.0, -0.2)
		seg.material_override = skin
		pivot.add_child(seg)
		_fingers.append(pivot)

	_thumb = Node3D.new()
	_thumb.position = Vector3(0.34, 0.0, -0.05)
	_thumb.rotation_degrees.y = -40.0
	add_child(_thumb)
	var tseg := MeshInstance3D.new()
	var tmesh := CapsuleMesh.new()
	tmesh.radius = 0.06
	tmesh.height = 0.36
	tseg.mesh = tmesh
	tseg.rotation_degrees.x = 90.0
	tseg.position = Vector3(0.0, 0.0, -0.16)
	tseg.material_override = skin
	_thumb.add_child(tseg)
	_aura = OmniLight3D.new()
	_aura.light_color = Color(0.42, 1.0, 0.9)
	_aura.light_energy = 0.0
	_aura.omni_range = 4.6
	_aura.position = Vector3(0.0, 0.1, 0.0)
	add_child(_aura)

	set_pose("open")

func set_pose(pose: String) -> void:
	_pose = pose
	match pose:
		"open":     _targets(0.18, 0.25, 0.0, 1.0)
		"flat":     _targets(0.05, 0.1, 0.12, 1.0)   # pressing/panning the ground
		"grip":     _targets(1.15, 0.9, 0.15, 0.85)
		"carry":    _targets(0.95, 0.8, 0.05, 0.85)
		"point":    _targets(1.1, 0.9, -0.08, 0.9)   # gesture mode; index stays out
		"reach":    _targets(0.35, 0.3, -0.25, 1.0)
		_:          _targets(0.18, 0.25, 0.0, 1.0)

func _targets(curl: float, thumb: float, tilt: float, spread: float) -> void:
	_curl_target = curl
	_thumb_target = thumb
	_tilt_target = tilt
	_spread_target = spread

func set_miracle_armed(on: bool) -> void:
	for mat in _skin_mats:
		mat.emission_energy_multiplier = 0.9 if on else 0.12
	_aura.light_energy = 1.9 if on else 0.0

func _process(delta: float) -> void:
	var k := 1.0 - exp(-12.0 * delta)
	for i in _fingers.size():
		var curl := _curl_target
		if _pose == "point" and i == 1:
			curl = 0.05   # index finger extended for sacred drawing
		_fingers[i].rotation.x = lerpf(_fingers[i].rotation.x, curl, k)
		var base_x := -0.23 + i * 0.152
		_fingers[i].position.x = lerpf(_fingers[i].position.x, base_x * _spread_target, k)
	_thumb.rotation.x = lerpf(_thumb.rotation.x, _thumb_target, k)
	rotation.x = lerpf(rotation.x, _tilt_target, k)
