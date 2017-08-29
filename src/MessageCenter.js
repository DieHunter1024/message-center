/**************************************************
 * Created by nanyuantingfeng on 20/12/2016 14:51.
 **************************************************/
function fnAddHandler (eName, handler, context, weight) {
  this::fnGetHandlers(eName).push({handler, context, weight})
  this::fnGetHandlers(eName).sort((a, b) => b.weight - a.weight)
  return this
}

function fnGetHandlers (eName) {
  return this._handlers[eName]
}

function fnGetHandlerIndex (eName, handler) {
  return this::fnHas(eName)
    ? this::fnGetHandlers(eName).findIndex(element => element.handler === handler)
    : -1
}

function fnAchieveMaxListener (eName) {
  return (this._maxListeners !== null && this._maxListeners <= this.listenersNumber(eName))
}

function fnHandlerIsExists (eName, handler, context) {
  const handlerInd = this::fnGetHandlerIndex(eName, handler)
  const activeHandler = handlerInd !== -1 ? this::fnGetHandlers(eName)[handlerInd] : void 0
  return (handlerInd !== -1 && activeHandler && activeHandler.context === context)
}

function fnHas (eName) {
  return !!this._events[eName]
}

function fnOn (eName, handler, context = null, weight = 1) {

  if (typeof handler !== 'function') {
    throw new TypeError(`${handler} is not a function`)
  }

  if (!this::fnHas(eName)) {
    this._events[eName] = eName
    this._handlers[eName] = []
  } else {
    // Check if we reached maximum number of listeners.
    if (this::fnAchieveMaxListener(eName)) {
      this._console.warn(`Max listeners (${this._maxListeners}) for event "${eName}" is reached!`)
    }

    // Check if the same handler has already added.
    if (this::fnHandlerIsExists(...arguments)) {
      this._console.warn(`Event "${eName}" already has the handler ${handler}.`)
    }
  }

  this::fnAddHandler(...arguments)
  return this
}

function fnUn (eName, handler = null) {
  let handlerInd
  if (this::fnHas(eName)) {
    if (handler === null) {
      this._events[eName] = undefined
      delete this._events[eName]
      this._handlers[eName] = null
    } else {
      handler = this::fnGetHandlerInMap(handler)
      handlerInd = this::fnGetHandlerIndex(eName, handler)
      if (handlerInd !== -1) {
        this::fnGetHandlers(eName).splice(handlerInd, 1)
        this::fnUn(...arguments)
      }
    }
  }
  return this
}

function fnEmit (eName) {
  const custom = this._handlers[eName]
  let i = custom ? custom.length : 0
  let len = arguments.length
  let args
  let current

  if (i > 0 && len > 1) {
    args = [].slice.call(arguments, 1)
  }

  while (i--) {
    current = custom[i]
    if (arguments.length > 1) {
      current.handler.apply(current.context, args)
    } else {
      current.handler.apply(current.context)
    }
  }
  args = null
  return this
}

function fnSetHandlerInMap (handler, realHandler) {
  this._watchHandlersMap.set(handler, realHandler)
}

function fnGetHandlerInMap (handler) {
  return this._watchHandlersMap.get(handler) || handler
}

function fnPrefixEventName (eName) {
  return `@@A0F2F71915C05BE72D17F48B2A49CEAD:${eName}`
}

function Defer () {
  let resolve = undefined
  let reject = undefined
  let promise = new Promise((a, b) => {
    resolve = a
    reject = b
  })
  return {promise, resolve, reject}
}

export default class MessageCenter {

  constructor (maxListeners = null, localConsole = console) {
    this._handlers = {}
    this._events = {}
    this._console = localConsole
    this._maxListeners = maxListeners === null ? null : parseInt(maxListeners, 10)
    this._watchHandlersMap = new WeakMap()
    return this
  }

  /*******************************************
   * 注册监听器("aaa|bbb|ccc")
   * @param eName
   * @param handler
   * @param context
   * @param weight
   * @returns {MessageCenter}
   */
  on (eName, handler, context = null, weight = 1) {
    eName.split('|').forEach(e => e && this::fnOn(e, handler, context, weight))
    return this
  }

  /*********************************************
   * 单次监听
   * @param eName
   * @param handler
   * @param context
   * @param weight
   * @returns {MessageCenter}
   */
  once (eName, handler, context = null, weight = 1) {
    let fn = (...args) => {
      this.un(eName, fn)
      return handler.apply(context, args)
    }
    return this.on(eName, fn, context, weight)
  }

  /*********************************************
   * 解除监听
   * @param eName
   * @param args
   * @returns {MessageCenter}
   */
  un (eName, ...args) {
    eName.split('|').forEach(e => e && this::fnUn(e, ...args))
    return this
  }

  /**********************************************
   * 触发监听
   * @param eName
   * @param args
   * @returns {MessageCenter}
   */
  emit (eName, ...args) {
    eName.split('|').forEach(e => e && this::fnEmit(e, ...args))
    return this
  }

  /******************************************
   * 清空当前实例中所有的监听
   * @returns {MessageCenter}
   */
  clear () {
    this._events = {}
    this._handlers = {}
    return this
  }

  /****************************************
   * 检测监听器的长度
   * @param eventName
   * @returns {number}
   */
  listenersNumber (eventName) {
    return this::fnHas(eventName) ? this._handlers[eventName].length : 0
  }

  /*********************************
   * 等待结果返回
   * @param name
   * @param handler
   * @param args
   * @returns {MessageCenter}
   */
  watch (name, handler, ...args) {
    let fn = (...data) => {
      this.emit(fnPrefixEventName(name), handler(...data))
    }
    this.on(name, fn, ...args)
    this::fnSetHandlerInMap(handler, fn)
    return this
  }

  /*************************
   * 触发结果返回
   * @param name
   * @param args
   * @returns {Promise}
   */
  invoke (name, ...args) {
    let {promise, resolve, reject} = Defer()
    if (!this.listenersNumber(name)) {
      reject(`have no watcher at event(${name})`)
    } else {
      this.once(fnPrefixEventName(name), resolve)
      this.emit(name, ...args)
    }
    return promise
  }
}
