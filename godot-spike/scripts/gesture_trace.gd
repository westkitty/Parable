extends Node3D
## Renders the luminous trail while a glyph is drawn: a chain of small
## emissive motes along the hand path. Success flares gold; failure calmly
## dissolves into drifting sparks — the world absorbing an unaccepted mark.

const MOTE_SPACING := 0.18
const MAX_MOTES := 28

var _motes: Array[MeshInstance3D] = []
var _mat: StandardMaterial3D
var _last_point := Vector3.INF
var _mote_mesh: SphereMesh
var _armed_ring: MeshInstance3D

func _ready() -> void:
	add_to_group("gesture_trace")
	_mote_mesh = SphereMesh.new()
	_mote_mesh.radius = 0.1
	_mote_mesh.height = 0.2
	for _i in MAX_MOTES:
		var mote := MeshInstance3D.new()
		mote.mesh = _mote_mesh
		mote.visible = false
		add_child(mote)
		_motes.append(mote)
	_armed_ring = MeshInstance3D.new()
	var ring := TorusMesh.new()
	ring.inner_radius = 0.72
	ring.outer_radius = 0.96
	_armed_ring.mesh = ring
	_armed_ring.rotation_degrees.x = 90.0
	_armed_ring.visible = false
	add_child(_armed_ring)

func begin() -> void:
	_clear()
	_mat = StandardMaterial3D.new()
	_mat.albedo_color = Color(1.0, 0.96, 0.72)
	_mat.emission_enabled = true
	_mat.emission = Color(1.0, 0.86, 0.45)
	_mat.emission_energy_multiplier = 3.6
	_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	_last_point = Vector3.INF

func set_armed_feedback() -> void:
	if _mat == null:
		return
	_mat.albedo_color = Color(0.52, 0.98, 0.92, 0.95)
	_mat.emission = Color(0.3, 1.0, 0.92)
	_mat.emission_energy_multiplier = 4.2
	var ring_mat := StandardMaterial3D.new()
	ring_mat.albedo_color = Color(0.22, 0.92, 0.86, 0.75)
	ring_mat.emission_enabled = true
	ring_mat.emission = Color(0.3, 1.0, 0.9)
	ring_mat.emission_energy_multiplier = 4.8
	ring_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	_armed_ring.material_override = ring_mat
	_armed_ring.visible = true
	var hand := get_tree().get_first_node_in_group("divine_hand")
	if hand:
		_armed_ring.global_position = hand.global_position + Vector3(0.0, 0.05, 0.0)
	var tw := _armed_ring.create_tween()
	_armed_ring.scale = Vector3.ONE * 0.65
	tw.tween_property(_armed_ring, "scale", Vector3.ONE * 1.25, 0.24)
	tw.tween_property(_armed_ring, "scale", Vector3.ONE * 0.95, 0.2)

func add_point(world_pos: Vector3) -> void:
	if _mat == null:
		return
	if _last_point != Vector3.INF and world_pos.distance_to(_last_point) < MOTE_SPACING:
		return
	_last_point = world_pos
	var mote := _motes[min(_visible_mote_count(), MAX_MOTES - 1)]
	if _visible_mote_count() >= MAX_MOTES:
		for i in range(MAX_MOTES - 1):
			_motes[i].global_position = _motes[i + 1].global_position
			_motes[i].material_override = _mat
			_motes[i].visible = true
		mote = _motes[MAX_MOTES - 1]
	mote.material_override = _mat
	mote.global_position = world_pos
	mote.visible = true

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
		if not m.visible:
			continue
		var tw := m.create_tween()
		tw.tween_property(m, "position:y", m.position.y + randf_range(0.4, 1.1), 0.9) \
			.set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	var fade := create_tween()
	fade.tween_property(mat, "albedo_color:a", 0.0, 0.9)
	fade.finished.connect(_clear)

func cancel() -> void:
	end_fail()

func clear_now() -> void:
	_clear()

func active_mote_count() -> int:
	return _visible_mote_count()

func _clear() -> void:
	for m in _motes:
		m.visible = false
		m.position = Vector3.ZERO
		m.scale = Vector3.ONE
	_armed_ring.visible = false
	_armed_ring.scale = Vector3.ONE
	_armed_ring.position = Vector3.ZERO
	_last_point = Vector3.INF

func _visible_mote_count() -> int:
	var count := 0
	for m in _motes:
		if m.visible:
			count += 1
	return count
