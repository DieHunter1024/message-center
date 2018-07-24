function Defer() {
    var resolve;
    var reject;
    var promise = new Promise(function (a, b) {
        resolve = a;
        reject = b;
    });
    return { promise: promise, resolve: resolve, reject: reject };
}
function prefixEventName(name) {
    return "@@A0F2F71915C05BE72D17F48B2A49CEAD:" + name;
}
var MessageCenter = (function () {
    function MessageCenter(maxListeners) {
        this.__handlers = {};
        this.__events = {};
        this.__maxListeners = null;
        this.__watchHandlersMap = new WeakMap();
        this.__maxListeners = maxListeners === null ? null : parseInt(String(maxListeners), 10);
    }
    MessageCenter.prototype.__addHandler = function (name, handler, context, weight) {
        this.__getHandlers(name).push({ handler: handler, context: context, weight: weight });
        this.__getHandlers(name).sort(function (a, b) { return b.weight - a.weight; });
        return this;
    };
    MessageCenter.prototype.__getHandlers = function (name) {
        return this.__handlers[name];
    };
    MessageCenter.prototype.__getHandlerIndex = function (name, handler) {
        return this.has(name)
            ? this.__getHandlers(name).findIndex(function (element) { return element.handler === handler; })
            : -1;
    };
    MessageCenter.prototype.__achieveMaxListener = function (name) {
        return (this.__maxListeners !== null && this.__maxListeners <= this.listenersLength(name));
    };
    MessageCenter.prototype.__handlerIsExists = function (name, handler, context) {
        var handlerInd = this.__getHandlerIndex(name, handler);
        var activeHandler = handlerInd !== -1 ? this.__getHandlers(name)[handlerInd] : void 0;
        return (handlerInd !== -1 && activeHandler && activeHandler.context === context);
    };
    MessageCenter.prototype.__on = function (name, handler, context, weight) {
        if (weight === void 0) { weight = 1; }
        if (typeof handler !== 'function') {
            throw new TypeError(handler + " is not a function");
        }
        if (!this.has(name)) {
            this.__events[name] = name;
            this.__handlers[name] = [];
        }
        else {
            if (this.__achieveMaxListener(name)) {
                console.warn("Max listeners (" + this.__maxListeners + ") for event \"" + name + "\" is reached!");
            }
            if (this.__handlerIsExists.apply(this, arguments)) {
                console.warn("Event \"" + name + "\" already has the handler " + handler + ".");
            }
        }
        this.__addHandler.apply(this, arguments);
        return this;
    };
    MessageCenter.prototype.__un = function (name, handler) {
        if (handler === void 0) { handler = null; }
        var handlerInd;
        if (this.has(name)) {
            if (handler === null) {
                this.__events[name] = undefined;
                delete this.__events[name];
                this.__handlers[name] = null;
            }
            else {
                handler = this.__getHandlerInMap(handler);
                handlerInd = this.__getHandlerIndex(name, handler);
                if (handlerInd !== -1) {
                    this.__getHandlers(name).splice(handlerInd, 1);
                    this.__un.apply(this, arguments);
                }
            }
        }
        return this;
    };
    MessageCenter.prototype.__emit = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var custom = this.__handlers[name];
        var i = custom ? custom.length : 0;
        var current;
        while (i--) {
            current = custom[i];
            current.handler.apply(current.context, args);
        }
        return this;
    };
    MessageCenter.prototype.__setHandlerInMap = function (handler, realHandler) {
        this.__watchHandlersMap.set(handler, realHandler);
    };
    MessageCenter.prototype.__getHandlerInMap = function (handler) {
        return this.__watchHandlersMap.get(handler) || handler;
    };
    MessageCenter.prototype.has = function (name) {
        return !!this.__events[name];
    };
    MessageCenter.prototype.on = function (name, handler, context, weight) {
        var _this = this;
        if (weight === void 0) { weight = 1; }
        name.split('|').forEach(function (e) { return e && _this.__on(e, handler, context, weight); });
        return this;
    };
    MessageCenter.prototype.once = function (name, handler, context, weight) {
        var _this = this;
        if (weight === void 0) { weight = 1; }
        var fn = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            _this.un(name, fn);
            return handler.apply(context, args);
        };
        return this.on(name, fn, context, weight);
    };
    MessageCenter.prototype.un = function (name, handler) {
        var _this = this;
        name.split('|').forEach(function (e) { return e && _this.__un(e, handler); });
        return this;
    };
    MessageCenter.prototype.emit = function (name) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        name.split('|').forEach(function (e) { return e && _this.__emit.apply(_this, [e].concat(args)); });
        return this;
    };
    MessageCenter.prototype.clear = function () {
        this.__events = {};
        this.__handlers = {};
        return this;
    };
    MessageCenter.prototype.listenersLength = function (name) {
        return this.has(name) ? this.__handlers[name].length : 0;
    };
    MessageCenter.prototype.watch = function (name, handler, context) {
        var _this = this;
        var fn = function () {
            var data = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                data[_i] = arguments[_i];
            }
            _this.emit(prefixEventName(name), handler.apply(void 0, data));
        };
        this.on(name, fn, context);
        this.__setHandlerInMap(handler, fn);
        return this;
    };
    MessageCenter.prototype.invoke = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var _a = Defer(), promise = _a.promise, resolve = _a.resolve, reject = _a.reject;
        if (!this.listenersLength(name)) {
            reject("have no watcher at event(" + name + ")");
        }
        else {
            this.once(prefixEventName(name), resolve);
            this.emit.apply(this, [name].concat(args));
        }
        return promise;
    };
    return MessageCenter;
}());
export default MessageCenter;
