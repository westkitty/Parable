class_name GestureRecognizer
extends RefCounted
## Deterministic geometric glyph recognizer. Two glyphs only:
##   "circle"  — starter blessing
##   "zigzag"  — shrine-learned bolt
## Feature approach (resample / bbox / closure / signed rotation / reversals)
## is conceptually informed by the old prototype's analyzeGesture; no code
## is ported. Everything here is tunable, debuggable plain geometry.

const RESAMPLE_COUNT := 32
const SPIRAL_RESAMPLE_COUNT := 36
const MIN_POINTS := 6
const MIN_SIZE_PX := 22.0
const MIN_PATH_LENGTH_PX := 86.0
const SPIRAL_MIN_PATH_LENGTH_PX := 64.0
const SPIRAL_MIN_ROTATION := -2.2
const SPIRAL_MIN_RADIUS_SWING := 0.015
const SPIRAL_TWO_LOOP_ROTATION := -8.2

## Returns {kind: "circle"|"zigzag"|"none", plus feature values for diagnostics}.
static func classify(raw: PackedVector2Array) -> Dictionary:
	var out := {
		"kind": "none", "rotation": 0.0, "closure": 1.0,
		"reversals": 0, "width": 0.0, "height": 0.0, "length": 0.0,
	}
	if raw.size() < MIN_POINTS:
		return out
	var pts := _resample(raw, RESAMPLE_COUNT)
	var lo := pts[0]
	var hi := pts[0]
	for p in pts:
		lo = Vector2(minf(lo.x, p.x), minf(lo.y, p.y))
		hi = Vector2(maxf(hi.x, p.x), maxf(hi.y, p.y))
	var w := maxf(hi.x - lo.x, 1.0)
	var h := maxf(hi.y - lo.y, 1.0)
	var span := maxf(w, h)
	var length := 0.0
	for i in range(1, pts.size()):
		length += pts[i].distance_to(pts[i - 1])
	var closure := pts[0].distance_to(pts[-1]) / span
	var rotation := _total_signed_rotation(pts)
	var reversals := _x_reversals(pts, w)
	out.rotation = rotation
	out.closure = closure
	out.reversals = reversals
	out.width = w
	out.height = h
	out.length = length
	if span < MIN_SIZE_PX or length < MIN_PATH_LENGTH_PX:
		return out

	# Circle: roughly one full turn, nearly closed, roughly round.
	var aspect := w / h
	if absf(rotation) > 3.1 and absf(rotation) < 10.4 \
			and closure < 0.9 and aspect > 0.32 and aspect < 3.1:
		out.kind = "circle"
		return out

	# Vertical zigzag: taller than wide, several horizontal direction
	# reversals, long path, and no net rotation build-up.
	if h > w * 0.5 and reversals >= 2 and length > h * 0.92 and absf(rotation) < 6.2:
		out.kind = "zigzag"
		return out

	return out

static func detect_spiral(raw: PackedVector2Array) -> Dictionary:
	var out := {
		"kind": "none",
		"rotation": 0.0,
		"length": 0.0,
		"radius_swing": 0.0,
		"clockwise": false,
		"loop_estimate": 0.0,
	}
	if raw.size() < MIN_POINTS:
		return out
	var pts := _resample(raw, SPIRAL_RESAMPLE_COUNT)
	var centroid := Vector2.ZERO
	for p in pts:
		centroid += p
	centroid /= float(pts.size())
	var lo := pts[0]
	var hi := pts[0]
	var length := 0.0
	var radii: Array[float] = []
	for i in pts.size():
		var p: Vector2 = pts[i]
		lo = Vector2(minf(lo.x, p.x), minf(lo.y, p.y))
		hi = Vector2(maxf(hi.x, p.x), maxf(hi.y, p.y))
		radii.append(p.distance_to(centroid))
		if i > 0:
			length += p.distance_to(pts[i - 1])
	var span := maxf(hi.x - lo.x, hi.y - lo.y)
	if span < MIN_SIZE_PX or length < SPIRAL_MIN_PATH_LENGTH_PX:
		return out
	var rotation := _centroid_rotation(pts, centroid)
	var mean_radius := 0.0
	for r in radii:
		mean_radius += r
	mean_radius /= float(radii.size())
	var radius_swing := absf(radii[-1] - radii[0]) / maxf(mean_radius, 1.0)
	out.rotation = rotation
	out.length = length
	out.radius_swing = radius_swing
	out.clockwise = rotation <= SPIRAL_MIN_ROTATION
	out.loop_estimate = absf(rotation) / TAU
	var two_loops := rotation <= SPIRAL_TWO_LOOP_ROTATION
	var sloppy_clockwise := rotation <= -1.8 and length >= SPIRAL_MIN_PATH_LENGTH_PX * 1.25
	if (rotation <= SPIRAL_MIN_ROTATION and radius_swing >= SPIRAL_MIN_RADIUS_SWING) or two_loops or sloppy_clockwise:
		out.kind = "spiral"
	return out

static func _resample(raw: PackedVector2Array, count: int) -> PackedVector2Array:
	var total := 0.0
	for i in range(1, raw.size()):
		total += raw[i].distance_to(raw[i - 1])
	if total <= 0.0:
		return raw.duplicate()
	var spacing := total / float(count - 1)
	var result := PackedVector2Array([raw[0]])
	var acc := 0.0
	var prev := raw[0]
	var i := 1
	while i < raw.size():
		var seg := prev.distance_to(raw[i])
		if seg <= 0.0:
			prev = raw[i]
			i += 1
			continue
		if acc + seg >= spacing:
			var t := (spacing - acc) / seg
			var inserted := prev.lerp(raw[i], t)
			result.append(inserted)
			prev = inserted
			acc = 0.0
		else:
			acc += seg
			prev = raw[i]
			i += 1
	while result.size() < count:
		result.append(raw[-1])
	return result

static func _total_signed_rotation(pts: PackedVector2Array) -> float:
	var total := 0.0
	for i in range(2, pts.size()):
		var a := pts[i - 1] - pts[i - 2]
		var b := pts[i] - pts[i - 1]
		if a.length() < 0.001 or b.length() < 0.001:
			continue
		total += a.angle_to(b)
	return total

static func _x_reversals(pts: PackedVector2Array, width: float) -> int:
	var threshold := width * 0.04
	var reversals := 0
	var last_sign := 0
	for i in range(1, pts.size()):
		var dx := pts[i].x - pts[i - 1].x
		if absf(dx) < threshold:
			continue
		var s := 1 if dx > 0.0 else -1
		if last_sign != 0 and s != last_sign:
			reversals += 1
		last_sign = s
	return reversals

static func _centroid_rotation(pts: PackedVector2Array, centroid: Vector2) -> float:
	var total := 0.0
	var last_angle := (pts[0] - centroid).angle()
	for i in range(1, pts.size()):
		var angle := (pts[i] - centroid).angle()
		var delta := wrapf(angle - last_angle, -PI, PI)
		total += delta
		last_angle = angle
	return total
