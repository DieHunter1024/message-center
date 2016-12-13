/************************************************
 * Created By nanyuantingfeng On 5/30/16 02:44.
 ************************************************/
class MessageCenter {

  constructor(maxListeners = null, localConsole = console) {
    const self = this

    self._callbacks = {};
    self._events = {}
    self._console = localConsole;
    self._maxListeners = maxListeners === null ? null : parseInt(maxListeners, 10);

    return this;
  }

  _addCallback(eventName, callback, context, weight) {
    this._getCallbacks(eventName).push({ callback, context, weight });
    this._getCallbacks(eventName).sort((a, b) => b.weight - a.weight);
    return this;
  }

  _getCallbacks(eventName) {
    return this._callbacks[eventName];
  }

  _getCallbackIndex(eventName, callback) {
    return this._has(eventName) ?
      this._getCallbacks(eventName)
        .findIndex(element => element.callback === callback) : -1;
  }

  _achieveMaxListener(eventName) {
    const self = this;
    return (self._maxListeners !== null && self._maxListeners <= this.listenersNumber(eventName));
  }

  _callbackIsExists(eventName, callback, context) {
    const callbackInd = this._getCallbackIndex(eventName, callback);
    const activeCallback = callbackInd !== -1 ?
      this._getCallbacks(eventName)[callbackInd] : void 0;

    return (callbackInd !== -1 && activeCallback && activeCallback.context === context);
  }

  _has(eventName) {
    return !!this._events[eventName]
  }

  _on(eventName, callback, context = null, weight = 1) {
    const self = this;

    if (typeof callback !== 'function') {
      throw new TypeError(`${callback} is not a function`);
    }

    // If event wasn't added before - just add it
    // and define callbacks as an empty object.
    if (!this._has(eventName)) {
      self._events[eventName] = eventName;
      self._callbacks[eventName] = [];
    } else {
      // Check if we reached maximum number of listeners.
      if (this._achieveMaxListener(eventName)) {
        self._console.warn(`Max listeners (${self._maxListeners}) for event "${eventName}" is reached!`);
      }

      // Check if the same callback has already added.
      if (this._callbackIsExists(...arguments)) {
        self._console.warn(`Event "${eventName}" already has the callback ${callback}.`);
      }
    }

    this._addCallback(...arguments);
    return this;
  }

  _off(eventName, callback = null) {
    const self = this;
    let callbackInd;
    if (this._has(eventName)) {
      if (callback === null) {
        self._events[eventName] = undefined;
        delete self._events[eventName]
        self._callbacks[eventName] = null;
      } else {
        callbackInd = this._getCallbackIndex(eventName, callback);
        if (callbackInd !== -1) {
          this._getCallbacks(eventName).splice(callbackInd, 1);
          this._off(...arguments);
        }
      }
    }
    return this;
  }

  _emit(eventName) {
    const custom = this._callbacks[eventName];
    let i = custom ? custom.length : 0;
    let len = arguments.length;
    let args;
    let current;

    if (i > 0 && len > 1) {
      args = [].slice.call(arguments, 1)
    }

    while (i--) {
      current = custom[i];
      if (arguments.length > 1) {
        current.callback.apply(current.context, args);
      } else {
        current.callback.apply(current.context);
      }
    }
    args = null;
    return this;
  }

  on(...args) {
    let eventName = args.shift();
    eventName.split("|").forEach(e => e && this._on.call(this, e, ...args));
    return this;
  }

  once(eventName, callback, context = null, weight = 1) {
    const onceCallback = (...args) => {
      this.off(eventName, onceCallback);
      return callback.apply(context, args);
    };
    return this.on(eventName, onceCallback, context, weight);
  }

  off(...args) {
    let eventName = args.shift();
    eventName.split("|").forEach(e => e && this._off.call(this, e, ...args));
    return this;
  }

  emit(...args) {
    let eventName = args.shift();
    eventName.split("|").forEach(e => e && this._emit.call(this, e, ...args));
    return this;
  }

  fire() {
    return this.emit.apply(this, arguments)
  }

  un() {
    return this.off.apply(this, arguments);
  }

  clear() {
    const self = this;
    self._events = {};
    self._callbacks = {};
    return this;
  }

  listenersNumber(eventName) {
    return this._has(eventName) ? this._callbacks[eventName].length : null;
  }
}

module.exports = MessageCenter;
