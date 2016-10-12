
var canvas
var cx

function init_context() {
	canvas = $('#canvas')[0]
	cx = canvas.getContext('2d')
}

function clear_canvas() {
	cx.clearRect(0, 0, canvas.width, canvas.height)
}

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

function m4_translation(offset) {
	return mat4(
		1,  0,  0,  offset.x,
		0,  1,  0,  offset.y,
		0,  0,  1,  offset.z,
		0,  0,  0,  1
	)
}

/**
 * Creates a matrix to rotate around an axis by a given angle. The axis doesn't
 * need to be normalized.
 *
 * Sources:
 *
 * https://en.wikipedia.org/wiki/Rotation_matrix#Rotation_matrix_from_axis_and_angle
 */
function m4_rotation(angle_in_rad, axis) {
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

/**
 * Multiplication of two 4x4 matrices.
 *
 * Implemented by following the row times column rule and illustrating it on a
 * whiteboard with the proper indices in mind.
 *
 * Further reading: https://en.wikipedia.org/wiki/Matrix_multiplication
 * But note that the article use the first index for rows and the second for
 * columns.
 */
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

/**
 * Multiplies a 4x4 matrix with a 3D vector representing a point in 3D space.
 *
 * Before the matrix multiplication the vector is first expanded to a 4D vector
 * (x, y, z, 1). After the multiplication the vector is reduced to 3D again by
 * dividing through the 4th component (if it's not 0 or 1).
 */
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

var xoffset = 300
var yoffset = 300
var scale = 100
var d = 2
var trans_mat = m4_identity()

function project(p) {
	var p = m4_mul_p(trans_mat, p)
	var x = xoffset + scale * p.x / (p.z + d)
	var y = yoffset + scale * p.y / (p.z + d)
	return vec2(x, y)
}

function line3(p1, p2) {
	var p1 = project(p1)
	var p2 = project(p2)
	cx.beginPath()
	cx.moveTo(p1.x, p1.y)
	cx.lineTo(p2.x, p2.y)
	cx.stroke()
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
	cx.strokeStyle = '#ffffff'

	var a = 0
	setInterval(function() {
		a = a + Math.PI / 64
		var mr = m4_rotation(a, vec3(-1, 1, 1))
		var mt = m4_translation(vec3(-0.5, -0.5, -0.5))
		trans_mat = m4_mul(mr, mt)
		clear_canvas()
		cube()

	}, 1/30 * 1000)


})
