/**************************************************
 * Created by nanyuantingfeng on 20/12/2016 14:51.
 **************************************************/
function fnAddHandler (name, handler, context, weight) {
  this::fnGetHandlers(name).push({handler, context, weight})
  this::fnGetHandlers(name).sort((a, b) => b.weight - a.weight)
  return this
}

function fnGetHandlers (name) {
  return this._handlers[name]
}

function fnGetHandlerIndex (name, handler) {
  return this::fnHas(name)
    ? this::fnGetHandlers(name).findIndex(element => element.handler === handler)
    : -1
}

function fnAchieveMaxListener (name) {
  return (this._maxListeners !== null && this._maxListeners <= this.listenersNumber(name))
}

function fnHandlerIsExists (name, handler, context) {
  const handlerInd = this::fnGetHandlerIndex(name, handler)
  const activeHandler = handlerInd !== -1 ? this::fnGetHandlers(name)[handlerInd] : void 0
  return (handlerInd !== -1 && activeHandler && activeHandler.context === context)
}

function fnHas (name) {
  return !!this._events[name]
}

function fnOn (name, handler, context = null, weight = 1) {

  if (typeof handler !== 'function') {
    throw new TypeError(`${handler} is not a function`)
  }

  if (!this::fnHas(name)) {
    this._events[name] = name
    this._handlers[name] = []
  } else {
    // Check if we reached maximum number of listeners.
    if (this::fnAchieveMaxListener(name)) {
      this._console.warn(`Max listeners (${this._maxListeners}) for event "${name}" is reached!`)
    }

    // Check if the same handler has already added.
    if (this::fnHandlerIsExists(...arguments)) {
      this._console.warn(`Event "${name}" already has the handler ${handler}.`)
    }
  }

  this::fnAddHandler(...arguments)
  return this
}

function fnUn (name, handler = null) {
  let handlerInd
  if (this::fnHas(name)) {
    if (handler === null) {
      this._events[name] = undefined
      delete this._events[name]
      this._handlers[name] = null
    } else {
      handler = this::fnGetHandlerInMap(handler)
      handlerInd = this::fnGetHandlerIndex(name, handler)
      if (handlerInd !== -1) {
        this::fnGetHandlers(name).splice(handlerInd, 1)
        this::fnUn(...arguments)
      }
    }
  }
  return this
}

function fnEmit (name) {
  const custom = this._handlers[name]
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

function fnPrefixEventName (name) {
  return `@@A0F2F71915C05BE72D17F48B2A49CEAD:${name}`
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
   * @param name
   * @param handler
   * @param context
   * @param weight
   * @returns {MessageCenter}
   */
  on (name, handler, context = null, weight = 1) {
    name.split('|').forEach(e => e && this::fnOn(e, handler, context, weight))
    return this
  }

  /*********************************************
   * 单次监听
   * @param name
   * @param handler
   * @param context
   * @param weight
   * @returns {MessageCenter}
   */
  once (name, handler, context = null, weight = 1) {
    let fn = (...args) => {
      this.un(name, fn)
      return handler.apply(context, args)
    }
    return this.on(name, fn, context, weight)
  }

  /*********************************************
   * 解除监听
   * @param name
   * @param args
   * @returns {MessageCenter}
   */
  un (name, ...args) {
    name.split('|').forEach(e => e && this::fnUn(e, ...args))
    return this
  }

  /**********************************************
   * 触发监听
   * @param name
   * @param args
   * @returns {MessageCenter}
   */
  emit (name, ...args) {
    name.split('|').forEach(e => e && this::fnEmit(e, ...args))
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
   * @param name
   * @returns {number}
   */
  listenersNumber (name) {
    return this::fnHas(name) ? this._handlers[name].length : 0
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
