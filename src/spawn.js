
const {Queueue} = require('./queueue');

class Spawn extends Promise {
  constructor(fn) {

    super((resolve, reject) => {
      const send = (data) => this._send(data);

      const close = (value) => {
        this._close(value);
        resolve(value);
      }

      const error = (err) => {
        this._error(err);
        reject(err);
      }

      fn(send, close, error);
    });

    this._promises = new Queueue();
    this._values = new Queueue();

    this._closed = false;
  }

  _error(err) {

    if (this._closed) {

      throw new Error("Iterable already closed, cannor error");
    } else {

      this._close = true;
  
      this._update();
  
      while (this._promises.length > 0) {
        const {reject} = this._promises.dequeue();
  
        reject(err);
      }
    }
  }

  _close(value = null) {
    if (this._closed) {

      throw new Error("Iterable already closed, cannot close");
    } else {
      this._close = true;
  
      this._update();
  
      while (this._promises.length > 0) {
        const {resolve} = this._promises.dequeue();
  
        resolve({done: true, value});
      }
    }
  }

  _send(data) {
    if (!this._closed) {
      this._values.enqueue(data);

      this._update();
    } else {
      throw new Error("Iterable already closed, cannot send")
    }
  }

  _update() {
    while (this._promises.length > 0 && this._values.length > 0) {
      const {resolve} = this._promises.dequeue();
      const value = this._values.dequeue();

      resolve({value, done: false});
    }
  }

  iterate() {
    return {
      [Symbol.asyncIterator]() {
        return this;
      },

      next: () => {
        if (this._closed) {
          const done = true;

          this
            .then((value) => Promise.resolve({done, value}))
            .catch((err) => Promise.reject(err))
        }

        if (this._promises.length > 1) {
          return new Promise.reject(new Error("Cannot proceed until last "));
        } else {
          return new Promise((resolve, reject) => {
            this._promises.enqueue({
              resolve,
              reject
            });

            this._update();
          });  
        }
      }
    }
  }

  [Symbol.asyncIterator]() {
    return this.iterate();
  }
}

module.exports = {Spawn}
