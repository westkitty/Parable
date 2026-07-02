class_name ThrowSampler
extends RefCounted
## Ring buffer of hand positions (camera-rig-local space) over a short window.
## Rig-local sampling means camera motion contributes zero throw velocity.

const WINDOW_SEC := 0.22

var _positions: Array[Vector3] = []
var _times: Array[float] = []

func clear() -> void:
	_positions.clear()
	_times.clear()

func add_sample(pos_local: Vector3, t: float) -> void:
	_positions.append(pos_local)
	_times.append(t)
	while _times.size() > 2 and _times[0] < t - WINDOW_SEC:
		_times.pop_front()
		_positions.pop_front()

## Average velocity across the window, in rig-local space.
func velocity() -> Vector3:
	if _times.size() < 2:
		return Vector3.ZERO
	var dt := _times[-1] - _times[0]
	if dt <= 0.0001:
		return Vector3.ZERO
	return (_positions[-1] - _positions[0]) / dt

func peak_speed() -> float:
	if _times.size() < 2:
		return 0.0
	var best := 0.0
	for i in range(1, _times.size()):
		var dt := _times[i] - _times[i - 1]
		if dt <= 0.0001:
			continue
		best = maxf(best, (_positions[i] - _positions[i - 1]).length() / dt)
	return best
