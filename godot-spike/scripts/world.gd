extends Node3D
## World hub: wires the scene together, places structures, spawns the
## grabbable cast, owns the world↔temple transition and the symbol ritual.
## Deliberately dumb about everything else.

const VillagerScene := preload("res://scenes/objects/Villager.tscn")
const RockScene := preload("res://scenes/objects/Rock.tscn")
const TreeScene := preload("res://scenes/objects/Tree.tscn")
const OfferingScene := preload("res://scenes/objects/Offering.tscn")
const TempleInteriorScene := preload("res://scenes/TempleInterior.tscn")

const VILLAGE_CENTER := Vector3(7.0, 0.0, 5.0)
const SHRINE_POS := Vector2(-13.0, -6.0)
const TEMPLE_POS := Vector2(11.0, -13.0)
const FADE_TIME := 0.4
const SYMBOL_SPACING := 2.9

var identity: Node
var director: Node

var _island: Node
var _hand: Node
var _rig: Node
var _shrine: Node
var _doorway: Node
var _fade: ColorRect
var _interior: Node = null
var _in_temple := false
var _saved_rig_state := {}
var _ritual_started := false
var _village_stone: Node3D
var _symbol_choices: Array[Node] = []
var _symbol_pick := ""
var _mouse_hidden_requested := false

signal _symbol_picked(id: String)

func _ready() -> void:
	add_to_group("world")
	Input.set_mouse_mode(Input.MOUSE_MODE_HIDDEN)
	_mouse_hidden_requested = true
	identity = get_node_or_null("/root/GodIdentity")
	if identity == null:
		# Headless test path: no autoload registration, create a local one.
		identity = load("res://scripts/god_identity.gd").new()
		identity.name = "GodIdentity"
		add_child(identity)
	director = $WitnessDirector
	director.add_to_group("witness_director")
	_island = $Island
	_hand = $DivineHand
	_rig = $CameraRig
	_shrine = $Shrine
	_doorway = $TempleDoorway
	_setup_environment()
	_place_structures()
	_spawn_cast()
	_build_fade_layer()
	director.god_event.connect(_on_god_event)

func _exit_tree() -> void:
	Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)

func mouse_hidden_for_play() -> bool:
	return _mouse_hidden_requested

func scene_label() -> String:
	return "temple" if _in_temple else "world"

func current_temple_chamber() -> String:
	if _interior and _in_temple and _interior.has_method("current_chamber"):
		return _interior.current_chamber()
	return "-"

# --- Environment / placement -------------------------------------------------

func _setup_environment() -> void:
	$Sun.rotation_degrees = Vector3(-52.0, 38.0, 0.0)
	$Sun.light_energy = 1.55
	$Sun.shadow_enabled = true
	var env := Environment.new()
	env.background_mode = Environment.BG_SKY
	var sky := Sky.new()
	var sky_mat := ProceduralSkyMaterial.new()
	sky_mat.sky_top_color = Color(0.28, 0.56, 0.86)
	sky_mat.sky_horizon_color = Color(0.9, 0.93, 0.98)
	sky_mat.ground_bottom_color = Color(0.18, 0.32, 0.46)
	sky_mat.ground_horizon_color = Color(0.82, 0.88, 0.93)
	sky.sky_material = sky_mat
	env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env.ambient_light_energy = 1.15
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)

func _place_structures() -> void:
	_shrine.position = _island.ground_point(SHRINE_POS.x, SHRINE_POS.y)
	_shrine.rotation.y = deg_to_rad(35.0)
	_doorway.position = _island.ground_point(TEMPLE_POS.x, TEMPLE_POS.y)
	_doorway.rotation.y = deg_to_rad(-30.0)   # doorway faces the village

	# Village stone — where the chosen symbol will be painted.
	_village_stone = MeshInstance3D.new()
	_village_stone.name = "VillageStone"
	var slab := BoxMesh.new()
	slab.size = Vector3(1.6, 1.9, 0.5)
	_village_stone.mesh = slab
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.55, 0.53, 0.5)
	mat.roughness = 0.95
	_village_stone.material_override = mat
	add_child(_village_stone)
	var sp: Vector3 = _island.ground_point(VILLAGE_CENTER.x + 2.8, VILLAGE_CENTER.z + 1.8)
	_village_stone.position = sp + Vector3(0.0, 0.8, 0.0)
	_village_stone.rotation.y = deg_to_rad(-40.0)

	# A few simple huts so the village reads as a village.
	for i in 3:
		var hut := MeshInstance3D.new()
		var box := BoxMesh.new()
		box.size = Vector3(1.8, 1.4, 1.8)
		hut.mesh = box
		var hm := StandardMaterial3D.new()
		hm.albedo_color = Color(0.5, 0.38, 0.24)
		hut.material_override = hm
		var ang := i * 2.1 + 0.6
		var hp: Vector3 = _island.ground_point(VILLAGE_CENTER.x + cos(ang) * 4.0, VILLAGE_CENTER.z + sin(ang) * 4.0)
		hut.position = hp + Vector3(0.0, 0.7, 0.0)
		hut.rotation.y = ang
		add_child(hut)
		var roof := MeshInstance3D.new()
		var prism := PrismMesh.new()
		prism.size = Vector3(2.0, 0.9, 2.0)
		roof.mesh = prism
		var rm := StandardMaterial3D.new()
		rm.albedo_color = Color(0.65, 0.55, 0.35)
		roof.material_override = rm
		roof.position = hut.position + Vector3(0.0, 1.15, 0.0)
		roof.rotation.y = ang
		add_child(roof)

func _spawn_cast() -> void:
	var parent := $Grabbables
	# Villagers ring the village center.
	for i in 8:
		var v := VillagerScene.instantiate()
		var ang := (i / 8.0) * TAU
		var r := randf_range(1.5, 4.5)
		var p: Vector3 = _island.ground_point(VILLAGE_CENTER.x + cos(ang) * r, VILLAGE_CENTER.z + sin(ang) * r)
		parent.add_child(v)
		v.global_position = p + Vector3(0.0, 0.85, 0.0)
		v.home = v.global_position
		_connect_release_contract(v)
	# Rocks scattered.
	for rp in [Vector2(0, 10), Vector2(-4, 8), Vector2(3, -3), Vector2(12, 0), Vector2(-2, -12)]:
		var rock := RockScene.instantiate()
		parent.add_child(rock)
		rock.place_on_surface(_island, rp)
		_connect_release_contract(rock)
	# Trees anchored.
	for tp in [Vector2(-6, 10), Vector2(14, 6), Vector2(-16, 2), Vector2(2, -16)]:
		var tree := TreeScene.instantiate()
		parent.add_child(tree)
		tree.place_on_surface(_island, tp)
		_connect_release_contract(tree)
	# Offerings between village and shrine.
	for op in [Vector2(-12.0, -4.6), Vector2(-10.6, -6.0)]:
		var off := OfferingScene.instantiate()
		parent.add_child(off)
		off.place_on_surface(_island, op)
		_connect_release_contract(off)

func _build_fade_layer() -> void:
	var layer := CanvasLayer.new()
	layer.name = "FadeLayer"
	layer.layer = 50
	add_child(layer)
	_fade = ColorRect.new()
	_fade.color = Color(0, 0, 0, 0)
	_fade.set_anchors_preset(Control.PRESET_FULL_RECT)
	_fade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(_fade)

# --- Miracles -----------------------------------------------------------------

## Called by hand_input when a stroke finishes. Returns true when the world
## accepted the glyph (drives trace success/fail feedback).
func cast_glyph(kind: String, target: Vector3) -> bool:
	match kind:
		"circle":
			if not identity.learned_blessing:
				return false
			MiracleFx.blessing(self, target)
			director.announce("blessing", target)
			if not _ritual_started:
				_ritual_started = true
				_run_symbol_ritual.call_deferred(target)
			return true
		"zigzag":
			var hand_pos: Vector3 = _hand.global_position
			if not identity.learned_bolt and _shrine.is_awakened() \
					and _shrine.within_learn_range(hand_pos):
				_shrine.teach(identity, director)
				return true
			if identity.learned_bolt:
				MiracleFx.bolt(self, target)
				director.announce("bolt", target)
				return true
			_shrine.reject_attempt("zigzag_locked")
			return false
	return false

# --- Symbol ritual --------------------------------------------------------------

func _run_symbol_ritual(near_point: Vector3) -> void:
	await get_tree().create_timer(0.9).timeout
	var asker := _nearest_free_villager(near_point)
	if asker == null:
		_ritual_started = false
		return
	var ask_point := near_point + Vector3(1.2, 0.0, 1.2)
	ask_point = _island.ground_point(ask_point.x, ask_point.z) + Vector3(0.0, 0.85, 0.0)
	asker.command_move_to(ask_point)
	await asker.command_arrived
	asker.show_question(true)
	_spawn_symbol_choices(ask_point)
	var id: String = await _symbol_picked
	asker.show_question(false)
	identity.choose_symbol(id)
	var stone_front: Vector3 = _village_stone.global_position + Vector3(0.0, -0.6, 1.0)
	asker.command_move_to(stone_front)
	await asker.command_arrived
	_paint_symbol_on_stone(id)
	director.announce("symbol_painted", _village_stone.global_position)
	asker.resume_idle()

func _nearest_free_villager(p: Vector3) -> Node:
	var best: Node = null
	var best_d := 999.0
	for v in get_tree().get_nodes_in_group("villager"):
		if v.is_held or v.is_airborne:
			continue
		var d: float = v.global_position.distance_to(p)
		if d < best_d:
			best_d = d
			best = v
	return best

func _spawn_symbol_choices(around: Vector3) -> void:
	var choice_script := load("res://scripts/symbol_choice.gd")
	for i in SymbolForms.IDS.size():
		var id := SymbolForms.IDS[i]
		var holder: Area3D = choice_script.new()
		holder.name = "SymbolChoice_" + id
		holder.symbol_id = id
		holder.collision_layer = 4
		holder.collision_mask = 0
		holder.monitoring = false
		holder.add_to_group("interactive")
		var col := CollisionShape3D.new()
		var shape := SphereShape3D.new()
		shape.radius = 1.1
		col.shape = shape
		holder.add_child(col)
		var visual := SymbolForms.build(id)
		holder.add_child(visual)
		add_child(holder)
		holder.scale = Vector3(1.7, 1.7, 1.7)
		holder.global_position = around + Vector3((i - 1) * SYMBOL_SPACING, 1.8, 0.0)
		if _rig and _rig.camera:
			holder.look_at(_rig.camera.global_position, Vector3.UP, true)
		_symbol_choices.append(holder)

func handle_symbol_click(area: Node) -> void:
	var id: String = area.symbol_id
	for c in _symbol_choices:
		if is_instance_valid(c):
			var tw := c.create_tween()
			tw.tween_property(c, "scale", Vector3(0.01, 0.01, 0.01), 0.4)
			tw.finished.connect(c.queue_free)
	_symbol_choices.clear()
	_symbol_picked.emit(id)

func _paint_symbol_on_stone(id: String) -> void:
	var painted := SymbolForms.build(id, 1.6)
	painted.scale = Vector3(0.9, 0.9, 0.9)
	_village_stone.add_child(painted)
	painted.position = Vector3(0.0, 0.25, 0.3)

# --- Temple flow -----------------------------------------------------------------

func enter_temple() -> void:
	if _in_temple:
		return
	_in_temple = true
	_hand.enabled = false
	_hand.visible = false
	_saved_rig_state = _rig.save_state()
	var door_point: Vector3 = _doorway.doorway_point()
	await _rig.fly_toward(door_point, 8.0, 1.2)
	await _fade_to(1.0, FADE_TIME)
	if _interior == null:
		_interior = TempleInteriorScene.instantiate()
		add_child(_interior)
		_interior.position = Vector3(0.0, -300.0, 0.0)   # far below the island
	_interior.enter(self)
	await _fade_to(0.0, FADE_TIME)

func exit_temple() -> void:
	if not _in_temple:
		return
	await _fade_to(1.0, FADE_TIME)
	_interior.leave()
	_rig.restore_state(_saved_rig_state)
	_rig.camera.make_current()
	_rig.locked = false
	_hand.enabled = true
	_hand.visible = true
	_in_temple = false
	await _fade_to(0.0, FADE_TIME)

func _fade_to(alpha: float, seconds: float) -> Signal:
	var tw := create_tween()
	tw.tween_property(_fade, "color:a", alpha, seconds)
	return tw.finished

# --- Witness routing ---------------------------------------------------------------

func _on_god_event(_kind: String, _pos: Vector3, _data: Dictionary) -> void:
	pass   # villagers subscribe directly; hook kept for future world reactions

func _connect_release_contract(obj: Node) -> void:
	if obj and obj.has_signal("released") and not obj.released.is_connected(_on_grabbable_released):
		obj.released.connect(_on_grabbable_released)

func _on_grabbable_released(obj: Grabbable, mode: String, at: Vector3, _speed: float) -> void:
	if obj.display_name == "offering":
		_shrine.process_offering_release(obj, mode, at)
