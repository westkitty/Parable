extends StaticBody3D
## Old-god shrine. Bears a dormant zigzag glyph motif. A gently placed
## offering awakens it; tracing the zigzag nearby while awakened teaches
## the bolt permanently. Not grabbable, not a puzzle system.

enum ShrineState { DORMANT, AWAKENED, TAUGHT }

const LEARN_RADIUS := 9.0
const OFFER_RADIUS := 5.4
const OFFER_REJECT_RADIUS := 7.0
const PREVIEW_RADIUS := 8.0

var state: int = ShrineState.DORMANT

var _glyph_mat: StandardMaterial3D
var _altar_point := Vector3.ZERO
var _pulse: Tween
var _reject_mat: StandardMaterial3D
var _altar_mat: StandardMaterial3D
var _last_reject := "-"
var _drop_ring: MeshInstance3D

func _ready() -> void:
	add_to_group("shrine")
	collision_layer = 1
	collision_mask = 0
	_build()

func _process(delta: float) -> void:
	var hand := get_tree().get_first_node_in_group("divine_hand")
	var preview := false
	if hand and hand.has_method("held_object_name") and hand.held_object_name() == "offering":
		preview = hand.global_position.distance_to(altar_point()) <= PREVIEW_RADIUS
	if _drop_ring:
		_drop_ring.visible = preview
		_drop_ring.rotation.y += delta * 0.8
	if preview and _altar_mat:
		_altar_mat.emission_energy_multiplier = maxf(_altar_mat.emission_energy_multiplier, 2.2 if state == ShrineState.DORMANT else 2.8)
	if preview and _glyph_mat and state == ShrineState.DORMANT:
		_glyph_mat.emission_energy_multiplier = maxf(_glyph_mat.emission_energy_multiplier, 1.2)
	if state == ShrineState.DORMANT:
		for g in get_tree().get_nodes_in_group("grabbable"):
			if g.display_name == "offering" and g.recent_gentle_release and not g.consumed and within_offer_range(g.global_position):
				receive_offering(g)
				break

func is_awakened() -> bool:
	return state == ShrineState.AWAKENED

func current_state_label() -> String:
	return ["dormant", "awakened", "taught"][state]

func last_reject_reason() -> String:
	return _last_reject

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
	_last_reject = "-"
	if _altar_mat:
		_altar_mat.emission_enabled = true
		_altar_mat.emission = Color(0.28, 1.0, 0.9)
		_altar_mat.emission_energy_multiplier = 2.4
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

func reject_attempt(reason := "reject") -> void:
	_last_reject = reason
	if _reject_mat == null:
		return
	var tw := create_tween()
	tw.tween_property(_reject_mat, "emission_energy_multiplier", 4.0, 0.12)
	tw.tween_property(_reject_mat, "emission_energy_multiplier", 0.6, 0.35)
	if _altar_mat:
		var tw2 := create_tween()
		tw2.tween_property(_altar_mat, "emission_energy_multiplier", 3.8, 0.1)
		tw2.tween_property(_altar_mat, "emission_energy_multiplier", 0.5, 0.3)

func process_offering_release(offering: Node, mode: String, at: Vector3) -> bool:
	if offering == null or offering.display_name != "offering" or offering.consumed:
		return false
	var d := at.distance_to(altar_point())
	if mode == "drop" and d <= OFFER_RADIUS:
		receive_offering(offering)
		return true
	if d <= OFFER_REJECT_RADIUS:
		reject_attempt("offering_" + mode)
	return false

func _build() -> void:
	var stone := StandardMaterial3D.new()
	stone.albedo_color = Color(0.45, 0.44, 0.42)
	stone.roughness = 0.95

	# Altar slab + two pillars + back stele carrying the glyph.
	_altar_mat = StandardMaterial3D.new()
	_altar_mat.albedo_color = Color(0.54, 0.5, 0.46)
	_altar_mat.roughness = 0.92
	_altar_mat.emission_enabled = true
	_altar_mat.emission = Color(0.2, 0.9, 0.82)
	_altar_mat.emission_energy_multiplier = 0.5
	_block(Vector3(2.4, 0.5, 1.6), Vector3(0.0, 0.25, 1.1), _altar_mat)
	_drop_ring = MeshInstance3D.new()
	var torus := TorusMesh.new()
	torus.inner_radius = 1.45
	torus.outer_radius = 1.78
	_drop_ring.mesh = torus
	var ring_mat := StandardMaterial3D.new()
	ring_mat.albedo_color = Color(0.3, 0.95, 0.88, 0.7)
	ring_mat.emission_enabled = true
	ring_mat.emission = Color(0.3, 1.0, 0.92)
	ring_mat.emission_energy_multiplier = 3.2
	ring_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	_drop_ring.material_override = ring_mat
	_drop_ring.position = Vector3(0.0, 0.42, 1.1)
	_drop_ring.rotation_degrees.x = 90.0
	_drop_ring.visible = false
	add_child(_drop_ring)
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
