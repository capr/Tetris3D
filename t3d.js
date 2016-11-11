
// 3D math -------------------------------------------------------------------
// https://github.com/arkanis/single-header-file-c-libs/blob/master/math_3d.h

function vec2(x, y) {
	return {'x': x, 'y': y}
}

function vec3(x, y, z) {
	return {'x': x, 'y': y, 'z': z}
}

function v3_length(v) {
	return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z)
}

function v3_norm(v) {
	var len = v3_length(v)
	if (len > 0)
		return vec3(v.x / len, v.y / len, v.z / len)
	else
		return vec3(0, 0, 0)
}

function mat4(
	m00, m10, m20, m30,
	m01, m11, m21, m31,
	m02, m12, m22, m32,
	m03, m13, m23, m33
) {
	return [
		[m00, m01, m02, m03],
		[m10, m11, m12, m13],
		[m20, m21, m22, m23],
		[m30, m31, m32, m33]
	]
}

function m4_identity() {
	return mat4(
		1,  0,  0,  0,
		0,  1,  0,  0,
		0,  0,  1,  0,
		0,  0,  0,  1
	)
}

function m4_translated(offset) {
	return mat4(
		1,  0,  0,  offset.x,
		0,  1,  0,  offset.y,
		0,  0,  1,  offset.z,
		0,  0,  0,  1
	)
}

function m4_scaled(scale) {
	var x = scale.x
	var y = scale.y
	var z = scale.z
	return mat4(
		x,  0,  0,  0,
		0,  y,  0,  0,
		0,  0,  z,  0,
		0,  0,  0,  1
	)
}

// create a matrix to rotate around an axis by a given angle.
function m4_rotated(angle_in_rad, axis) {
	var normalized_axis = v3_norm(axis)
	var x = normalized_axis.x
	var y = normalized_axis.y
	var z = normalized_axis.z
	var c = Math.cos(angle_in_rad)
	var s = Math.sin(angle_in_rad)

	return mat4(
		c + x*x*(1-c),            x*y*(1-c) - z*s,      x*z*(1-c) + y*s,  0,
		    y*x*(1-c) + z*s,  c + y*y*(1-c),            y*z*(1-c) - x*s,  0,
		    z*x*(1-c) - y*s,      z*y*(1-c) + x*s,  c + z*z*(1-c),        0,
		    0,                        0,                    0,            1
	)
}

// multiply two 4x4 matrices.
function m4_mul(a, b) {
	var r = m4_identity()
	for (var i = 0; i < 4; i++)
		for (var j = 0; j < 4; j++) {
			var sum = 0
			for (var k = 0; k < 4; k++)
				sum += a[k][j] * b[i][k]
			r[i][j] = sum
		}
	return r
}

// multiply a 4x4 matrix with a 3D vector representing a point in 3D space.
function m4_mul_p(m, p) {
	var r = vec3(
		m[0][0] * p.x + m[1][0] * p.y + m[2][0] * p.z + m[3][0],
		m[0][1] * p.x + m[1][1] * p.y + m[2][1] * p.z + m[3][1],
		m[0][2] * p.x + m[1][2] * p.y + m[2][2] * p.z + m[3][2]
	)
	var w = m[0][3] * p.x + m[1][3] * p.y + m[2][3] * p.z + m[3][3]
	if (w != 0 && w != 1)
		return vec3(r.x / w, r.y / w, r.z / w)
	return r
}

// create an orthographic projection matrix.
function m4_ortho(left, right, bottom, top, back, front) {
	var l = left
	var r = right
	var b = bottom
	var t = top
	var n = front
	var f = back
	var tx = -(r + l) / (r - l)
	var ty = -(t + b) / (t - b)
	var tz = -(f + n) / (f - n)
	return mat4(
		2 / (r - l),  0,            0,            tx,
		0,            2 / (t - b),  0,            ty,
		0,            0,            2 / (f - n),  tz,
		0,            0,            0,            1
	)
}

// create a perspective projection matrix for a camera.
function m4_perspective(
	vertical_field_of_view_in_deg,
	aspect_ratio,
	near_view_distance,
	far_view_distance
) {
	var fovy_in_rad = vertical_field_of_view_in_deg / 180 * Math.PI
	var f = 1 / Math.tan(fovy_in_rad / 2)
	var ar = aspect_ratio
	var nd = near_view_distance
	var fd = far_view_distance

	return mat4(
		f / ar,           0,                0,                0,
		0,                f,                0,                0,
		0,                0,               (fd+nd)/(nd-fd),  (2*fd*nd)/(nd-fd),
		0,                0,               -1,                0
	)
}

// build a transformation matrix for a camera that looks from `from` towards
// `to`. `up` defines the direction that's upwards for the camera.
function m4_look_at(from, to, up) {
	var z = v3_muls(v3_norm(v3_sub(to, from)), -1)
	var x = v3_norm(v3_cross(up, z))
	var y = v3_cross(z, x)

	return mat4(
		x.x, x.y, x.z, -v3_dot(from, x),
		y.x, y.y, y.z, -v3_dot(from, y),
		z.x, z.y, z.z, -v3_dot(from, z),
		0,   0,   0,    1
	)
}

// interface -----------------------------------------------------------------

var canvas
var cx

var xoffset
var yoffset
var scale = 100
var d = 2
var trans_mat = m4_identity()

function project(p) {
	var p = m4_mul_p(trans_mat, p)
	var x = xoffset + scale * p.x / (p.z + d)
	var y = yoffset + scale * p.y / (p.z + d)
	return vec2(x, y)
}

function init_context() {
	canvas = $('#canvas')[0]
	canvas.width = $('#canvas').parent().width()
	canvas.height = $('#canvas').parent().height()
	cx = canvas.getContext('2d')
	xoffset = canvas.width / 2
	yoffset = canvas.height / 2
}

function clear_canvas() {
	cx.clearRect(0, 0, canvas.width, canvas.height)
}

function line3(p1, p2, color) {
	var p1 = project(p1)
	var p2 = project(p2)
	cx.beginPath()
	cx.moveTo(p1.x, p1.y)
	cx.lineTo(p2.x, p2.y)
	cx.strokeStyle = color || '#ffffff'
	cx.stroke()
	cx.closePath()
}

function rect3(p1, p2, p3, p4, color) {
	var p1 = project(p1)
	var p2 = project(p2)
	var p3 = project(p3)
	var p4 = project(p4)
	cx.beginPath()
	cx.moveTo(p1.x, p1.y)
	cx.lineTo(p2.x, p2.y)
	cx.lineTo(p3.x, p3.y)
	cx.lineTo(p4.x, p4.y)
	cx.fillStyle = color || '#ffffff'
	cx.fill()
	cx.closePath()
}

function cube() {

	var p1 = vec3(0, 0, 0)
	var p2 = vec3(1, 0, 0)
	var p3 = vec3(1, 1, 0)
	var p4 = vec3(0, 1, 0)
	var p5 = vec3(0, 0, 1)
	var p6 = vec3(1, 0, 1)
	var p7 = vec3(1, 1, 1)
	var p8 = vec3(0, 1, 1)

	rect3(p1, p2, p3, p4, '#000088') // front
	rect3(p5, p6, p7, p8, '#008800') // back
	rect3(p1, p4, p8, p5, '#880088') // top
	rect3(p2, p3, p7, p6, '#880000') // bottom
	rect3(p1, p2, p6, p5, '#888800') // left
	rect3(p3, p4, p8, p7, '#008888') // right

	line3(p1, p2)
	line3(p2, p3)
	line3(p3, p4)
	line3(p4, p1)

	line3(p5, p6)
	line3(p6, p7)
	line3(p7, p8)
	line3(p8, p5)

	line3(p1, p5)
	line3(p2, p6)
	line3(p3, p7)
	line3(p4, p8)
}

$(function() {

	init_context()

	var a = 0
	setInterval(function() {
		clear_canvas()

		a = a + Math.PI / 64
		var mr = m4_rotated(a, vec3(-1, 1, 1))
		var mt = m4_translated(vec3(-0.5, -0.5, -0.5))
		trans_mat = m4_mul(mr, mt)
		cube()
		var mt = m4_translated(vec3(1, 0, 0))
		trans_mat = m4_mul(trans_mat, mt)
		cube()

	}, 1/30 * 1000)

	$(window).resize(function() {
		init_context()
	})

})
