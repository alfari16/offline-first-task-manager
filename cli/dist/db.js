"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.Database = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _PouchyStore2 = _interopRequireDefault(require("./pouchy-store/PouchyStore"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var DB_NAME = 'tasks_manager';
var DB_ENDPOINT = 'http://13.250.43.79:5984/';
var DB_USER = 'admin';
var DB_PASSWORD = 'iniadmin';

var Database = /*#__PURE__*/function (_PouchyStore) {
  (0, _inherits2["default"])(Database, _PouchyStore);

  var _super = _createSuper(Database);

  function Database() {
    var _this;

    (0, _classCallCheck2["default"])(this, Database);
    _this = _super.call(this);

    console.e = function () {};

    return _this;
  }

  (0, _createClass2["default"])(Database, [{
    key: "allTask",
    value: function allTask(opt) {
      var completed = this.data.filter(function (el) {
        return el.isCompleted;
      });
      var incomplete = this.data.filter(function (el) {
        return !el.isCompleted;
      });
      var dataOpt = {
        completed: completed,
        incomplete: incomplete,
        "default": [].concat((0, _toConsumableArray2["default"])(incomplete), (0, _toConsumableArray2["default"])(completed))
      };
      return dataOpt[opt] || dataOpt['default'];
    }
  }, {
    key: "getTask",
    value: function getTask(id) {
      return this.allTask().find(function (el) {
        return el._id === id;
      });
    }
  }, {
    key: "lastSync",
    value: function lastSync() {
      return this.dataMeta.tsUpload;
    }
  }, {
    key: "syncData",
    value: function () {
      var _syncData = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return this.upload();

              case 3:
                _context.next = 8;
                break;

              case 5:
                _context.prev = 5;
                _context.t0 = _context["catch"](0);
                console.log("Problematic network. You need to do manual synchronization.");

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 5]]);
      }));

      function syncData() {
        return _syncData.apply(this, arguments);
      }

      return syncData;
    }()
  }, {
    key: "markComplete",
    value: function () {
      var _markComplete = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(content) {
        var _this$allTask$find, _id;

        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _this$allTask$find = this.allTask('incomplete').find(function (el) {
                  return el.content === content;
                }), _id = _this$allTask$find._id;
                _context2.next = 3;
                return this.editItem(_id, {
                  isCompleted: true
                });

              case 3:
                _context2.next = 5;
                return this.syncData();

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function markComplete(_x) {
        return _markComplete.apply(this, arguments);
      }

      return markComplete;
    }()
  }, {
    key: "name",
    get: function get() {
      return DB_NAME;
    }
  }, {
    key: "urlRemote",
    get: function get() {
      return DB_ENDPOINT;
    }
  }, {
    key: "optionsRemote",
    get: function get() {
      return {
        auth: {
          username: DB_USER,
          password: DB_PASSWORD
        }
      };
    }
  }]);
  return Database;
}(_PouchyStore2["default"]);

exports.Database = Database;

var _default = new Database();

exports["default"] = _default;