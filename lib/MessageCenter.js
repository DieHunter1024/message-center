"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/************************************************
 * Created By nanyuantingfeng On 5/30/16 02:44.
 ************************************************/
var MessageCenter = function () {
  function MessageCenter() {
    var maxListeners = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var localConsole = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : console;

    _classCallCheck(this, MessageCenter);

    var self = this;

    self._callbacks = {};
    self._events = {};
    self._console = localConsole;
    self._maxListeners = maxListeners === null ? null : parseInt(maxListeners, 10);

    return this;
  }

  _createClass(MessageCenter, [{
    key: "_addCallback",
    value: function _addCallback(eventName, callback, context, weight) {
      this._getCallbacks(eventName).push({ callback: callback, context: context, weight: weight });
      this._getCallbacks(eventName).sort(function (a, b) {
        return b.weight - a.weight;
      });
      return this;
    }
  }, {
    key: "_getCallbacks",
    value: function _getCallbacks(eventName) {
      return this._callbacks[eventName];
    }
  }, {
    key: "_getCallbackIndex",
    value: function _getCallbackIndex(eventName, callback) {
      return this._has(eventName) ? this._getCallbacks(eventName).findIndex(function (element) {
        return element.callback === callback;
      }) : -1;
    }
  }, {
    key: "_achieveMaxListener",
    value: function _achieveMaxListener(eventName) {
      var self = this;
      return self._maxListeners !== null && self._maxListeners <= this.listenersNumber(eventName);
    }
  }, {
    key: "_callbackIsExists",
    value: function _callbackIsExists(eventName, callback, context) {
      var callbackInd = this._getCallbackIndex(eventName, callback);
      var activeCallback = callbackInd !== -1 ? this._getCallbacks(eventName)[callbackInd] : void 0;

      return callbackInd !== -1 && activeCallback && activeCallback.context === context;
    }
  }, {
    key: "_has",
    value: function _has(eventName) {
      return !!this._events[eventName];
    }
  }, {
    key: "_on",
    value: function _on(eventName, callback) {
      var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var weight = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

      var self = this;

      if (typeof callback !== 'function') {
        throw new TypeError(callback + " is not a function");
      }

      // If event wasn't added before - just add it
      // and define callbacks as an empty object.
      if (!this._has(eventName)) {
        self._events[eventName] = eventName;
        self._callbacks[eventName] = [];
      } else {
        // Check if we reached maximum number of listeners.
        if (this._achieveMaxListener(eventName)) {
          self._console.warn("Max listeners (" + self._maxListeners + ") for event \"" + eventName + "\" is reached!");
        }

        // Check if the same callback has already added.
        if (this._callbackIsExists.apply(this, arguments)) {
          self._console.warn("Event \"" + eventName + "\" already has the callback " + callback + ".");
        }
      }

      this._addCallback.apply(this, arguments);
      return this;
    }
  }, {
    key: "_off",
    value: function _off(eventName) {
      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var self = this;
      var callbackInd = void 0;
      if (this._has(eventName)) {
        if (callback === null) {
          self._events[eventName] = undefined;
          delete self._events[eventName];
          self._callbacks[eventName] = null;
        } else {
          callbackInd = this._getCallbackIndex(eventName, callback);
          if (callbackInd !== -1) {
            this._getCallbacks(eventName).splice(callbackInd, 1);
            this._off.apply(this, arguments);
          }
        }
      }
      return this;
    }
  }, {
    key: "_emit",
    value: function _emit(eventName) {
      var custom = this._callbacks[eventName];
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
          current.callback.apply(current.context, args);
        } else {
          current.callback.apply(current.context);
        }
      }
      args = null;
      return this;
    }
  }, {
    key: "on",
    value: function on() {
      var _this = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var eventName = args.shift();
      eventName.split("|").forEach(function (e) {
        var _on2;

        return e && (_on2 = _this._on).call.apply(_on2, [_this, e].concat(args));
      });
      return this;
    }
  }, {
    key: "once",
    value: function once(eventName, callback) {
      var _this2 = this;

      var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var weight = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

      var onceCallback = function onceCallback() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        _this2.off(eventName, onceCallback);
        return callback.apply(context, args);
      };
      return this.on(eventName, onceCallback, context, weight);
    }
  }, {
    key: "off",
    value: function off() {
      var _this3 = this;

      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      var eventName = args.shift();
      eventName.split("|").forEach(function (e) {
        var _off2;

        return e && (_off2 = _this3._off).call.apply(_off2, [_this3, e].concat(args));
      });
      return this;
    }
  }, {
    key: "emit",
    value: function emit() {
      var _this4 = this;

      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      var eventName = args.shift();
      eventName.split("|").forEach(function (e) {
        var _emit2;

        return e && (_emit2 = _this4._emit).call.apply(_emit2, [_this4, e].concat(args));
      });
      return this;
    }
  }, {
    key: "fire",
    value: function fire() {
      return this.emit.apply(this, arguments);
    }
  }, {
    key: "un",
    value: function un() {
      return this.off.apply(this, arguments);
    }
  }, {
    key: "clear",
    value: function clear() {
      var self = this;
      self._events = {};
      self._callbacks = {};
      return this;
    }
  }, {
    key: "listenersNumber",
    value: function listenersNumber(eventName) {
      return this._has(eventName) ? this._callbacks[eventName].length : null;
    }
  }]);

  return MessageCenter;
}();

module.exports = MessageCenter;