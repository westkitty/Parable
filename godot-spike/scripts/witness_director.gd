extends Node
## WitnessDirector — one cheap event bus. Anything divine that happens in the
## world is announced here; villagers subscribe and filter by distance.

signal god_event(kind: String, pos: Vector3, data: Dictionary)

func announce(kind: String, pos: Vector3, data: Dictionary = {}) -> void:
	god_event.emit(kind, pos, data)
