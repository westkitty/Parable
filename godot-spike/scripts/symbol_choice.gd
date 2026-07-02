extends Area3D
## One floating symbol candidate during the "Who are you?" ritual.
## Clicked by the divine hand like any interactive; reports to the world.

var symbol_id := ""

func on_god_click(world: Node) -> void:
	if world:
		world.handle_symbol_click(self)
