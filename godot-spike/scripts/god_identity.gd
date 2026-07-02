extends Node
## GodIdentity — the only global state in the spike.
## Registered as an autoload in project.godot. In headless tests it is
## instanced manually and added to /root under the same name, so all
## lookups go through the node path, never the bare autoload global.

signal symbol_chosen(id: String)
signal miracle_learned(id: String)

var symbol: String = ""
var learned_blessing: bool = true
var learned_bolt: bool = false

func choose_symbol(id: String) -> void:
	symbol = id
	symbol_chosen.emit(id)

func learn_bolt() -> void:
	if learned_bolt:
		return
	learned_bolt = true
	miracle_learned.emit("bolt")
