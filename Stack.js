/**
 * General purpose stack
 *
 * Stack using clone_fun to clone object to be pushed on the stack.
 */
function Stack(clone_fun)
{
	/// Clone function, used when pushing a new object on the stack
	var _clone_fun = clone_fun;
	/// The stack itself
	var _stack = [];

	/**
	 * Push an object on the stack
	 *
	 * Push a clone of \a obj on the stack.
	 * @param obj The object to push on the stack
	 */
	this.push = function(obj)
	{
		_stack.push(_clone_fun(obj));
	}

	/**
	 * Pop from the stack
	 *
	 * Pop the last pushed object from the stack and return it. If the stack is
	 * empty, throw an error.
	 * @return The last object pushed on the stack
	 */
	this.pop = function()
	{
		if (_stack.length == 0)
			throw "Unable to pop empty stack";
		return _stack.pop();
	}
}
