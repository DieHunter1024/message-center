/**************************************************
 * Created by nanyuantingfeng on 20/12/2016 14:51.
 **************************************************/
class MessageCenter {

  constructor(maxListeners = null, localConsole = console) {
    this._handlers = {};
    this._events = {}
    this._console = localConsole;
    this._maxListeners = maxListeners === null ? null : parseInt(maxListeners, 10);
    return this;
  }

  _addHandler(eName, handler, context, weight) {
    this._getHandlers(eName).push({ handler, context, weight });
    this._getHandlers(eName).sort((a, b) => b.weight - a.weight);
    return this;
  }

  _getHandlers(eName) {
    return this._handlers[eName];
  }

  _getHandlerIndex(eName, handler) {
    return this._has(eName)
      ? this._getHandlers(eName).findIndex(element => element.handler === handler)
      : -1;
  }

  _achieveMaxListener(eName) {
    const self = this;
    return (self._maxListeners !== null && self._maxListeners <= this.listenersNumber(eName));
  }

  _handlerIsExists(eName, handler, context) {
    const handlerInd = this._getHandlerIndex(eName, handler);
    const activeHandler = handlerInd !== -1 ?
      this._getHandlers(eName)[handlerInd] : void 0;

    return (handlerInd !== -1 && activeHandler && activeHandler.context === context);
  }

  _has(eName) {
    return !!this._events[eName]
  }

  _on(eName, handler, context = null, weight = 1) {
    const self = this;

    if (typeof handler !== 'function') {
      throw new TypeError(`${handler} is not a function`);
    }

    // If event wasn't added before - just add it
    // and define handlers as an empty object.
    if (!this._has(eName)) {
      self._events[eName] = eName;
      self._handlers[eName] = [];
    } else {
      // Check if we reached maximum number of listeners.
      if (this._achieveMaxListener(eName)) {
        self._console.warn(`Max listeners (${self._maxListeners}) for event "${eName}" is reached!`);
      }

      // Check if the same handler has already added.
      if (this._handlerIsExists(...arguments)) {
        self._console.warn(`Event "${eName}" already has the handler ${handler}.`);
      }
    }

    this._addHandler(...arguments);
    return this;
  }

  _un(eName, handler = null) {
    const self = this;
    let handlerInd;
    if (this._has(eName)) {
      if (handler === null) {
        self._events[eName] = undefined;
        delete self._events[eName]
        self._handlers[eName] = null;
      } else {
        handlerInd = this._getHandlerIndex(eName, handler);
        if (handlerInd !== -1) {
          this._getHandlers(eName).splice(handlerInd, 1);
          this._un(...arguments);
        }
      }
    }
    return this;
  }

  _emit(eName) {
    const custom = this._handlers[eName];
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
        current.handler.apply(current.context, args);
      } else {
        current.handler.apply(current.context);
      }
    }
    args = null;
    return this;
  }

  /*******************************************
   * 注册监听器("aaa|bbb|ccc")
   * @param eName
   * @param handler
   * @param context
   * @param weight
   * @returns {MessageCenter}
   */
  on(eName, handler, context = null, weight = 1) {
    eName.split("|").forEach(e => e && this._on.call(this, e, handler, context, weight));
    return this;
  }

  /*********************************************
   * 单次监听
   * @param eName
   * @param handler
   * @param context
   * @param weight
   * @returns {MessageCenter}
   */
  once(eName, handler, context = null, weight = 1) {
    const fn = (...args) => {
      this.un(eName, fn);
      return handler.apply(context, args);
    };
    return this.on(eName, fn, context, weight);
  }

  /*********************************************
   * 解除监听
   * @param eName
   * @param args
   * @returns {MessageCenter}
   */
  un(eName, ...args) {
    eName.split("|").forEach(e => e && this._un.call(this, e, ...args));
    return this;
  }

  /**********************************************
   * 触发监听
   * @param eName
   * @param args
   * @returns {MessageCenter}
   */
  emit(eName, ...args) {
    eName.split("|").forEach(e => e && this._emit.call(this, e, ...args));
    return this;
  }

  /******************************************
   * 清空当前实例中所有的监听
   * @returns {MessageCenter}
   */
  clear() {
    this._events = {};
    this._handlers = {};
    return this;
  }

  /****************************************
   * 检测监听器的长度
   * @param eventName
   * @returns {number}
   */
  listenersNumber(eventName) {
    return this._has(eventName) ? this._handlers[eventName].length : 0;
  }
}

module.exports = MessageCenter;
