
class Queueue {
	static node(value, next = null) {
		return {value, next};
	}

	constructor() {
		// values move through the "digestive track" from head to ass

		// don't mess directly with any of these properties, seriously
		this._head = null;
		this._ass = null;
		this._length = 0;
	}

	// eat a value in the head of the queue
	enqueue(value) {
		if (this._length === 0) {
			this._ass = this._head = this.constructor.node(value);
		} else {
			this._head.next = this.constructor.node(value);
			this._head = this._head.next;
		}

		this._length++;
	}

	// crap a value out the ass of the queue
	dequeue() {
		if (this._length === 0)
			throw new Error('Cannot dequeue from empty Queue');
		else {
			const {value} = this._ass;
			this._ass = this._ass.next;

			if (this._length === 1)
				this._head = null;
			this._length--;

			return value;
		}
	}

	get length() {
		return this._length;
	}
}

module.exports = {Queueue};
