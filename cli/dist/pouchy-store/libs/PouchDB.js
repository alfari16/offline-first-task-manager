"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _pouchdb = _interopRequireDefault(require("pouchdb"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var PouchDB = /*#__PURE__*/function (_IPouchDB) {
  (0, _inherits2["default"])(PouchDB, _IPouchDB);

  var _super = _createSuper(PouchDB);

  function PouchDB() {
    (0, _classCallCheck2["default"])(this, PouchDB);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(PouchDB, [{
    key: "getFailSafe",
    value: function () {
      var _getFailSafe = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(id) {
        var doc;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return this.get(id);

              case 3:
                doc = _context.sent;
                return _context.abrupt("return", doc);

              case 7:
                _context.prev = 7;
                _context.t0 = _context["catch"](0);

                if (!(_context.t0.status === 404)) {
                  _context.next = 11;
                  break;
                }

                return _context.abrupt("return", null);

              case 11:
                throw _context.t0;

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 7]]);
      }));

      function getFailSafe(_x) {
        return _getFailSafe.apply(this, arguments);
      }

      return getFailSafe;
    }()
  }, {
    key: "update",
    value: function () {
      var _update = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(id, obj) {
        var doc, info;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.getFailSafe(id);

              case 2:
                _context2.t0 = _context2.sent;

                if (_context2.t0) {
                  _context2.next = 5;
                  break;
                }

                _context2.t0 = {
                  _id: id
                };

              case 5:
                doc = _context2.t0;
                Object.assign(doc, obj);
                _context2.next = 9;
                return this.put(doc);

              case 9:
                info = _context2.sent;
                return _context2.abrupt("return", info);

              case 11:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function update(_x2, _x3) {
        return _update.apply(this, arguments);
      }

      return update;
    }()
  }, {
    key: "createId",
    value: function createId() {
      return PouchDB.createId();
    }
  }, {
    key: "getDocs",
    value: function () {
      var _getDocs = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
        var result, docs;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.allDocs({
                  include_docs: true
                });

              case 2:
                result = _context3.sent;
                docs = result.rows.map(function (row) {
                  return row.doc;
                });
                return _context3.abrupt("return", docs);

              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getDocs() {
        return _getDocs.apply(this, arguments);
      }

      return getDocs;
    }()
  }], [{
    key: "createId",
    value: function createId() {
      var id = new Date().getTime().toString(16);

      while (id.length < 32) {
        id += Math.random().toString(16).split('.').pop();
      }

      id = id.substr(0, 32);
      id = id.replace(/(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/, '$1-$2-$3-$4-$5');
      return id;
    }
  }]);
  return PouchDB;
}(_pouchdb["default"]);

exports["default"] = PouchDB;