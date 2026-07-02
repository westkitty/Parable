extends Area3D
## The player temple facade and its clickable doorway. A clean click while
## empty-handed asks the world to enter the temple; clicking while carrying
## gets a silent refusal pulse (drop it first — reverence requires it).

var _door_mesh: MeshInstance3D

func _ready() -> void:
	add_to_group("temple_doorway")
	add_to_group("interactive")
	collision_layer = 4
	collision_mask = 0
	monitoring = false
	_build()

func on_god_click(world: Node) -> void:
	var hand := get_tree().get_first_node_in_group("divine_hand")
	if hand and hand.is_carrying():
		_refuse_pulse()
		return
	world.enter_temple()

func _refuse_pulse() -> void:
	var tw := create_tween()
	tw.tween_property(_door_mesh, "scale", Vector3(1.12, 1.12, 1.12), 0.12)
	tw.tween_property(_door_mesh, "scale", Vector3.ONE, 0.2)

func _build() -> void:
	var stone := StandardMaterial3D.new()
	stone.albedo_color = Color(0.7, 0.66, 0.58)
	stone.roughness = 0.85

	# Simple temple facade: base, two columns, pediment.
	_block(Vector3(6.0, 0.6, 4.5), Vector3(0.0, 0.3, 0.0), stone)
	_block(Vector3(0.7, 3.4, 0.7), Vector3(-2.1, 2.3, 1.6), stone)
	_block(Vector3(0.7, 3.4, 0.7), Vector3(2.1, 2.3, 1.6), stone)
	_block(Vector3(6.2, 0.9, 4.7), Vector3(0.0, 4.4, 0.0), stone)
	_block(Vector3(4.6, 3.2, 3.0), Vector3(0.0, 2.2, -0.6), stone)

	# The doorway itself: dark, faintly glowing — obviously an entrance.
	_door_mesh = MeshInstance3D.new()
	var door := BoxMesh.new()
	door.size = Vector3(1.6, 2.7, 0.3)
	_door_mesh.mesh = door
	var dark := StandardMaterial3D.new()
	dark.albedo_color = Color(0.06, 0.05, 0.1)
	dark.emission_enabled = true
	dark.emission = Color(0.9, 0.75, 0.4)
	dark.emission_energy_multiplier = 0.35
	_door_mesh.material_override = dark
	_door_mesh.position = Vector3(0.0, 1.95, 1.0)
	add_child(_door_mesh)

	var col := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = Vector3(1.8, 2.9, 1.0)
	col.shape = shape
	col.position = Vector3(0.0, 1.95, 1.2)
	add_child(col)

func _block(size: Vector3, pos: Vector3, mat: StandardMaterial3D) -> void:
	var mi := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = size
	mi.mesh = box
	mi.material_override = mat
	mi.position = pos
	add_child(mi)

func doorway_point() -> Vector3:
	return _door_mesh.global_position
