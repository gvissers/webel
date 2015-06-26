"use strict";

/**
 * Class to handle keyboard input
 */
function KeyHandler()
{
	/// Which keys are currently pressed
	this.keys_pressed = {}
}

/// Table of recognised key codes
KeyHandler.KeyCode = {
	Shift: 16,
	Control: 17,
	Alt: 18,
	PageUp: 33,
	PageDown: 34,
	End: 35,
	Home: 36,
	Left: 37,
	Up: 38,
	Right: 39,
	Down: 40,
	Insert: 45,
	Delete: 46,
	0: 48,
	1: 49,
	2: 50,
	3: 51,
	4: 52,
	5: 53,
	6: 54,
	7: 55,
	8: 56,
	9: 57,
	a: 65,
	b: 66,
	c: 67,
	d: 68,
	e: 69,
	f: 70,
	g: 71,
	h: 72,
	i: 73,
	j: 74,
	k: 75,
	l: 76,
	m: 77,
	n: 78,
	o: 79,
	p: 80,
	q: 81,
	r: 82,
	s: 83,
	t: 84,
	u: 85,
	v: 86,
	w: 87,
	x: 88,
	y: 89,
	z: 90,
};

/**
 * Handle a key-down event
 *
 * Handle a key-down event, marking the associated key code as pressed
 */
KeyHandler.prototype.handleKeyDown = function(event)
{
	this.keys_pressed[event.keyCode] = true;
};

/**
 * Handle a key-up event
 *
 * Handle a key-up event, removing the "pressed" mark from the associated key
 * code.
 */
KeyHandler.prototype.handleKeyUp = function(event)
{
	switch (event.keyCode)
	{
		case KeyHandler.KeyCode.Up:
			camera.rotateUp();
			break;
		case KeyHandler.KeyCode.Down:
			camera.rotateDown();
			break;
		case KeyHandler.KeyCode.Left:
			camera.rotateLeft();
			break;
		case KeyHandler.KeyCode.Right:
			camera.rotateRight();
			break;
		case KeyHandler.KeyCode.PageUp:
			camera.zoomOut();
			break;
		case KeyHandler.KeyCode.PageDown:
			camera.zoomIn();
			break;
		case KeyHandler.KeyCode.Insert:
			camera.stepForward();
			break;
		case KeyHandler.KeyCode.Delete:
			camera.stepBackward();
			break;
		case KeyHandler.KeyCode.p:
			console.log(camera.tile_pos);
			break;
	}
	this.keys_pressed[event.keyCode] = false;
};

/**
 * Handle keys pressed
 *
 * Evaluate which keys are pressed, and take the actions associated with them.
 */
KeyHandler.prototype.handleKeys = function()
{
	//game_window.handleKeys(this.keys_pressed);
}


