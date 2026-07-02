extends Node3D
## Renders the luminous trail while a glyph is drawn: a chain of small
## emissive motes along the hand path. Success flares gold; failure calmly
## dissolves into drifting sparks — the world absorbing an unaccepted mark.

const MOTE_SPACING := 0.22

var _motes: Array[MeshInstance3D] = []
var _mat: StandardMaterial3D
var _last_point := Vector3.INF

func _ready() -> void:
	add_to_group("gesture_trace")

func begin() -> void:
	_clear()
	_mat = StandardMaterial3D.new()
	_mat.albedo_color = Color(1.0, 0.9, 0.55)
	_mat.emission_enabled = true
	_mat.emission = Color(1.0, 0.82, 0.4)
	_mat.emission_energy_multiplier = 2.4
	_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	_last_point = Vector3.INF

func add_point(world_pos: Vector3) -> void:
	if _mat == null:
		return
	if _last_point != Vector3.INF and world_pos.distance_to(_last_point) < MOTE_SPACING:
		return
	_last_point = world_pos
	var mote := MeshInstance3D.new()
	var mesh := SphereMesh.new()
	mesh.radius = 0.075
	mesh.height = 0.15
	mote.mesh = mesh
	mote.material_override = _mat
	add_child(mote)
	mote.global_position = world_pos
	_motes.append(mote)

func end_success() -> void:
	if _mat == null:
		return
	var mat := _mat
	_mat = null
	mat.emission_energy_multiplier = 6.0
	var tw := create_tween()
	tw.tween_property(mat, "albedo_color:a", 0.0, 0.6).set_delay(0.25)
	tw.finished.connect(_clear)

func end_fail() -> void:
	if _mat == null:
		return
	var mat := _mat
	_mat = null
	# Calm dissolve: motes drift upward and fade. No text, no noise.
	for m in _motes:
		var tw := m.create_tween()
		tw.tween_property(m, "position:y", m.position.y + randf_range(0.4, 1.1), 0.9) \
			.set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	var fade := create_tween()
	fade.tween_property(mat, "albedo_color:a", 0.0, 0.9)
	fade.finished.connect(_clear)

func cancel() -> void:
	end_fail()

func _clear() -> void:
	for m in _motes:
		if is_instance_valid(m):
			m.queue_free()
	_motes.clear()
