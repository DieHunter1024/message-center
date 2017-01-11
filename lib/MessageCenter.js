"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**************************************************
 * Created by nanyuantingfeng on 20/12/2016 14:51.
 **************************************************/
var MessageCenter = function () {
  function MessageCenter() {
    var maxListeners = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var localConsole = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : console;

    _classCallCheck(this, MessageCenter);

    this._handlers = {};
    this._events = {};
    this._console = localConsole;
    this._maxListeners = maxListeners === null ? null : parseInt(maxListeners, 10);
    return this;
  }

  _createClass(MessageCenter, [{
    key: "_addHandler",
    value: function _addHandler(eName, handler, context, weight) {
      this._getHandlers(eName).push({ handler: handler, context: context, weight: weight });
      this._getHandlers(eName).sort(function (a, b) {
        return b.weight - a.weight;
      });
      return this;
    }
  }, {
    key: "_getHandlers",
    value: function _getHandlers(eName) {
      return this._handlers[eName];
    }
  }, {
    key: "_getHandlerIndex",
    value: function _getHandlerIndex(eName, handler) {
      return this._has(eName) ? this._getHandlers(eName).findIndex(function (element) {
        return element.handler === handler;
      }) : -1;
    }
  }, {
    key: "_achieveMaxListener",
    value: function _achieveMaxListener(eName) {
      var self = this;
      return self._maxListeners !== null && self._maxListeners <= this.listenersNumber(eName);
    }
  }, {
    key: "_handlerIsExists",
    value: function _handlerIsExists(eName, handler, context) {
      var handlerInd = this._getHandlerIndex(eName, handler);
      var activeHandler = handlerInd !== -1 ? this._getHandlers(eName)[handlerInd] : void 0;

      return handlerInd !== -1 && activeHandler && activeHandler.context === context;
    }
  }, {
    key: "_has",
    value: function _has(eName) {
      return !!this._events[eName];
    }
  }, {
    key: "_on",
    value: function _on(eName, handler) {
      var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var weight = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

      var self = this;

      if (typeof handler !== 'function') {
        throw new TypeError(handler + " is not a function");
      }

      // If event wasn't added before - just add it
      // and define handlers as an empty object.
      if (!this._has(eName)) {
        self._events[eName] = eName;
        self._handlers[eName] = [];
      } else {
        // Check if we reached maximum number of listeners.
        if (this._achieveMaxListener(eName)) {
          self._console.warn("Max listeners (" + self._maxListeners + ") for event \"" + eName + "\" is reached!");
        }

        // Check if the same handler has already added.
        if (this._handlerIsExists.apply(this, arguments)) {
          self._console.warn("Event \"" + eName + "\" already has the handler " + handler + ".");
        }
      }

      this._addHandler.apply(this, arguments);
      return this;
    }
  }, {
    key: "_un",
    value: function _un(eName) {
      var handler = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var self = this;
      var handlerInd = void 0;
      if (this._has(eName)) {
        if (handler === null) {
          self._events[eName] = undefined;
          delete self._events[eName];
          self._handlers[eName] = null;
        } else {
          handlerInd = this._getHandlerIndex(eName, handler);
          if (handlerInd !== -1) {
            this._getHandlers(eName).splice(handlerInd, 1);
            this._un.apply(this, arguments);
          }
        }
      }
      return this;
    }
  }, {
    key: "_emit",
    value: function _emit(eName) {
      var custom = this._handlers[eName];
      var i = custom ? custom.length : 0;
      var len = arguments.length;
      var args = void 0;
      var current = void 0;

      if (i > 0 && len > 1) {
        args = [].slice.call(arguments, 1);
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

  }, {
    key: "on",
    value: function on(eName, handler) {
      var _this = this;

      var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var weight = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

      eName.split("|").forEach(function (e) {
        return e && _this._on.call(_this, e, handler, context, weight);
      });
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

  }, {
    key: "once",
    value: function once(eName, handler) {
      var _this2 = this;

      var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var weight = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

      var fn = function fn() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this2.un(eName, fn);
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

  }, {
    key: "un",
    value: function un(eName) {
      var _this3 = this;

      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      eName.split("|").forEach(function (e) {
        var _un2;

        return e && (_un2 = _this3._un).call.apply(_un2, [_this3, e].concat(args));
      });
      return this;
    }

    /**********************************************
     * 触发监听
     * @param eName
     * @param args
     * @returns {MessageCenter}
     */

  }, {
    key: "emit",
    value: function emit(eName) {
      var _this4 = this;

      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      eName.split("|").forEach(function (e) {
        var _emit2;

        return e && (_emit2 = _this4._emit).call.apply(_emit2, [_this4, e].concat(args));
      });
      return this;
    }

    /******************************************
     * 清空当前实例中所有的监听
     * @returns {MessageCenter}
     */

  }, {
    key: "clear",
    value: function clear() {
      this._events = {};
      this._handlers = {};
      return this;
    }

    /****************************************
     * 检测监听器的长度
     * @param eventName
     * @returns {number}
     */

  }, {
    key: "listenersNumber",
    value: function listenersNumber(eventName) {
      return this._has(eventName) ? this._handlers[eventName].length : 0;
    }
  }]);

  return MessageCenter;
}();

module.exports = MessageCenter;