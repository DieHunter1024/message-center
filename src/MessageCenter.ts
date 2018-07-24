/**************************************************
 * Created by nanyuantingfeng on 20/12/2016 14:51.
 **************************************************/

interface IDefer {
  promise: Promise<any>;
  resolve: Function;
  reject: Function;
}

function Defer(): IDefer {
  let resolve;
  let reject;

  const promise = new Promise((a, b) => {
    resolve = a;
    reject = b;
  });

  return {promise, resolve, reject};
}

function prefixEventName(name): string {
  return `@@A0F2F71915C05BE72D17F48B2A49CEAD:${name}`;
}

export default class MessageCenter {

  private __handlers = {};

  private __events = {};

  private readonly __maxListeners = null;

  private __watchHandlersMap = new WeakMap();

  private __addHandler(name, handler, context, weight): this {
    this.__getHandlers(name).push({handler, context, weight});
    this.__getHandlers(name).sort((a, b) => b.weight - a.weight);
    return this;
  }

  private __getHandlers(name) {
    return this.__handlers[name];
  }

  private __getHandlerIndex(name, handler): number {
    return this.has(name)
      ? this.__getHandlers(name).findIndex(element => element.handler === handler)
      : -1;
  }

  private __achieveMaxListener(name): boolean {
    return (this.__maxListeners !== null && this.__maxListeners <= this.listenersLength(name));
  }

  private __handlerIsExists(name, handler, context): boolean {
    const handlerInd = this.__getHandlerIndex(name, handler);
    const activeHandler = handlerInd !== -1 ? this.__getHandlers(name)[handlerInd] : void 0;
    return (handlerInd !== -1 && activeHandler && activeHandler.context === context);
  }

  private __on(name: string, handler: Function, context?: any, weight = 1): this {

    if (typeof handler !== 'function') {
      throw new TypeError(`${handler} is not a function`);
    }

    if (!this.has(name)) {
      this.__events[name] = name;
      this.__handlers[name] = [];
    } else {
      // Check if we reached maximum number of listeners.
      if (this.__achieveMaxListener(name)) {
        console.warn(`Max listeners (${this.__maxListeners}) for event "${name}" is reached!`);
      }

      // Check if the same handler has already added.
      if (this.__handlerIsExists.apply(this, arguments)) {
        console.warn(`Event "${name}" already has the handler ${handler}.`);
      }
    }

    this.__addHandler.apply(this, arguments);
    return this;
  }

  private __un(name: string, handler = null) {
    let handlerInd;
    if (this.has(name)) {
      if (handler === null) {
        this.__events[name] = undefined;
        delete this.__events[name];
        this.__handlers[name] = null;
      } else {
        handler = this.__getHandlerInMap(handler);
        handlerInd = this.__getHandlerIndex(name, handler);
        if (handlerInd !== -1) {
          this.__getHandlers(name).splice(handlerInd, 1);
          this.__un.apply(this, arguments);
        }
      }
    }
    return this;
  }

  private __emit(name: string, ...args): this {
    const custom = this.__handlers[name];
    let i = custom ? custom.length : 0;
    let current;

    while (i--) {
      current = custom[i];
      current.handler.apply(current.context, args);
    }

    return this;
  }

  private __setHandlerInMap(handler, realHandler) {
    this.__watchHandlersMap.set(handler, realHandler);
  }

  private __getHandlerInMap(handler) {
    return this.__watchHandlersMap.get(handler) || handler;
  }

  constructor(maxListeners ?: number|string|null) {
    this.__maxListeners = maxListeners === null ? null : parseInt(String(maxListeners), 10);
  }

  has(name: string): boolean {
    return !!this.__events[name];
  }

  on(name: string, handler: Function, context?: any, weight = 1): this {
    name.split('|').forEach(e => e && this.__on(e, handler, context, weight));
    return this;
  }

  /*********************************************
   * 单次监听
   */
  once(name: string, handler: Function, context?: any, weight = 1): this {
    const fn = (...args) => {
      this.un(name, fn);
      return handler.apply(context, args);
    };
    return this.on(name, fn, context, weight);
  }

  /*********************************************
   * 解除监听
   */
  un(name: string, handler ?: Function): this {
    name.split('|').forEach(e => e && this.__un(e, handler));
    return this;
  }

  /**********************************************
   * 触发监听
   */
  emit(name: string, ...args): this {
    name.split('|').forEach(e => e && this.__emit(e, ...args));
    return this;
  }

  /******************************************
   * 清空当前实例中所有的监听
   */
  clear(): this {
    this.__events = {};
    this.__handlers = {};
    return this;
  }

  /****************************************
   * 检测监听器的长度
   * @param name
   * @returns {number}
   */
  listenersLength(name: string): number {
    return this.has(name) ? this.__handlers[name].length : 0;
  }

  /*********************************
   * 等待结果返回
   */
  watch(name: string, handler: Function, context ?: any): this {
    const fn = (...data) => {
      this.emit(prefixEventName(name), handler(...data));
    };

    this.on(name, fn, context);
    this.__setHandlerInMap(handler, fn);
    return this;
  }

  /*************************
   * 触发结果返回
   */
  invoke(name: string, ...args): Promise<any> {
    const {promise, resolve, reject} = Defer();

    if (!this.listenersLength(name)) {
      reject(`have no watcher at event(${name})`);
    } else {
      this.once(prefixEventName(name), resolve);
      this.emit(name, ...args);
    }

    return promise;
  }
}
