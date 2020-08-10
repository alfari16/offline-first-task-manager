"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _PouchDB = _interopRequireDefault(require("./libs/PouchDB.js"));

var _PouchyStore = _interopRequireDefault(require("./PouchyStore.js"));

var _pouchdbAdapterReactNativeSqlite = _interopRequireDefault(require("./libs/pouchdb-adapter-react-native-sqlite"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

_PouchDB["default"].plugin(_pouchdbAdapterReactNativeSqlite["default"]);

var PouchyStore = /*#__PURE__*/function (_IPouchyStore) {
  (0, _inherits2["default"])(PouchyStore, _IPouchyStore);

  var _super = _createSuper(PouchyStore);

  function PouchyStore() {
    var _this;

    (0, _classCallCheck2["default"])(this, PouchyStore);
    _this = _super.call(this);
    _this.optionsLocal.adapter = 'react-native-sqlite';
    return _this;
  }

  return PouchyStore;
}(_PouchyStore["default"]);

exports["default"] = PouchyStore;