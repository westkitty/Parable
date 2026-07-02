extends StaticBody3D
## Old-god shrine. Bears a dormant zigzag glyph motif. A gently placed
## offering awakens it; tracing the zigzag nearby while awakened teaches
## the bolt permanently. Not grabbable, not a puzzle system.

enum ShrineState { DORMANT, AWAKENED, TAUGHT }

const LEARN_RADIUS := 8.0
const OFFER_RADIUS := 4.0

var state: int = ShrineState.DORMANT

var _glyph_mat: StandardMaterial3D
var _altar_point := Vector3.ZERO
var _pulse: Tween
var _reject_mat: StandardMaterial3D

func _ready() -> void:
	add_to_group("shrine")
	collision_layer = 1
	collision_mask = 0
	_build()

func is_awakened() -> bool:
	return state == ShrineState.AWAKENED

func altar_point() -> Vector3:
	return global_position + Vector3(0.0, 1.05, 1.1)

func within_offer_range(p: Vector3) -> bool:
	return p.distance_to(altar_point()) < OFFER_RADIUS

func within_learn_range(p: Vector3) -> bool:
	return p.distance_to(global_position) < LEARN_RADIUS

func receive_offering(offering: Node) -> void:
	if state != ShrineState.DORMANT:
		return
	offering.consume_at(altar_point())
	state = ShrineState.AWAKENED
	_pulse = create_tween().set_loops()
	_pulse.tween_property(_glyph_mat, "emission_energy_multiplier", 3.2, 0.9) \
		.set_trans(Tween.TRANS_SINE)
	_pulse.tween_property(_glyph_mat, "emission_energy_multiplier", 1.4, 0.9) \
		.set_trans(Tween.TRANS_SINE)

func teach(identity: Node, director: Node) -> void:
	if state != ShrineState.AWAKENED:
		return
	state = ShrineState.TAUGHT
	if _pulse:
		_pulse.kill()
	identity.learn_bolt()
	var tw := create_tween()
	tw.tween_property(_glyph_mat, "emission_energy_multiplier", 9.0, 0.3)
	tw.tween_property(_glyph_mat, "emission_energy_multiplier", 2.2, 1.2)
	if director:
		director.announce("bolt_learned", global_position)

func reject_attempt() -> void:
	if _reject_mat == null:
		return
	var tw := create_tween()
	tw.tween_property(_reject_mat, "emission_energy_multiplier", 4.0, 0.12)
	tw.tween_property(_reject_mat, "emission_energy_multiplier", 0.6, 0.35)

func _build() -> void:
	var stone := StandardMaterial3D.new()
	stone.albedo_color = Color(0.45, 0.44, 0.42)
	stone.roughness = 0.95

	# Altar slab + two pillars + back stele carrying the glyph.
	_block(Vector3(2.4, 0.5, 1.6), Vector3(0.0, 0.25, 1.1), stone)
	_block(Vector3(0.5, 2.6, 0.5), Vector3(-1.2, 1.3, -0.4), stone)
	_block(Vector3(0.5, 2.6, 0.5), Vector3(1.2, 1.3, -0.4), stone)
	_block(Vector3(2.9, 0.5, 0.7), Vector3(0.0, 2.85, -0.4), stone)
	_block(Vector3(2.0, 2.4, 0.3), Vector3(0.0, 1.35, -0.75), stone)

	# Dormant zigzag glyph on the stele face.
	_glyph_mat = StandardMaterial3D.new()
	_glyph_mat.albedo_color = Color(0.9, 0.75, 0.4)
	_glyph_mat.emission_enabled = true
	_glyph_mat.emission = Color(1.0, 0.72, 0.25)
	_glyph_mat.emission_energy_multiplier = 0.25
	_reject_mat = _glyph_mat
	var zig_points := [
		Vector2(-0.3, 0.8), Vector2(0.3, 0.4), Vector2(-0.3, 0.0),
		Vector2(0.3, -0.4), Vector2(-0.3, -0.8),
	]
	for i in range(zig_points.size() - 1):
		var a: Vector2 = zig_points[i]
		var b: Vector2 = zig_points[i + 1]
		var mid := (a + b) * 0.5
		var seg := MeshInstance3D.new()
		var box := BoxMesh.new()
		box.size = Vector3(a.distance_to(b), 0.09, 0.06)
		seg.mesh = box
		seg.material_override = _glyph_mat
		seg.position = Vector3(mid.x, 1.35 + mid.y, -0.58)
		seg.rotation.z = (b - a).angle()
		add_child(seg)

	var col := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = Vector3(3.0, 3.2, 2.6)
	col.shape = shape
	col.position = Vector3(0.0, 1.6, 0.0)
	add_child(col)

func _block(size: Vector3, pos: Vector3, mat: StandardMaterial3D) -> void:
	var mi := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = size
	mi.mesh = box
	mi.material_override = mat
	mi.position = pos
	add_child(mi)
