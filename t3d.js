
var cx

function init_context() {
	var canvas = $('#canvas')[0]
	cx = canvas.getContext('2d')
}

function pt2(x, y) {
	return {'x': x, 'y': y}
}

function pt3(x, y, z) {
	return {'x': x, 'y': y, 'z': z}
}

function trans3(m, p) {
	return pt3(
		p.x - 0.5,
		p.y - 0.5,
		p.z
	)
}

var xoffset = 300
var yoffset = 300
var scale = 100
var d = 2
var mt = [
	1, 0, 0, 0,
	1, 1, 0, 0,
	1, 0, 1, 0,
	0, 0, 1, 0
]

function project(p) {
	var p = trans3(mt, p)
	var x = xoffset + scale * p.x / (p.z + d)
	var y = yoffset + scale * p.y / (p.z + d)
	return pt2(x, y)
}

function line3(p1, p2) {
	var p1 = project(p1)
	var p2 = project(p2)
	cx.moveTo(p1.x, p1.y)
	cx.lineTo(p2.x, p2.y)
	cx.stroke()
}

function cube() {

	var p1 = pt3(0, 0, 0)
	var p2 = pt3(1, 0, 0)
	var p3 = pt3(1, 1, 0)
	var p4 = pt3(0, 1, 0)
	var p5 = pt3(0, 0, 1)
	var p6 = pt3(1, 0, 1)
	var p7 = pt3(1, 1, 1)
	var p8 = pt3(0, 1, 1)

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

	cube()

})
