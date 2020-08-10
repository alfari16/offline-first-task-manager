"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _PouchDB = _interopRequireDefault(require("./libs/PouchDB"));

var _generateReplicationId = _interopRequireDefault(require("./libs/generateReplicationId"));

var _checkInternet = _interopRequireDefault(require("./libs/checkInternet"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

console.e = console.log;
var ID_META_DOC = 'meta';
var PREFIX_META_DB = 'meta_';
/*

class options: create getter fo these:
- `this.isUseData` boolean: give false if you do not want to mirror db data to this.data. default to true.
- `this.isUseRemote` boolean: give false if you do not want to sync with remote db. default to true.
- `this.optionsRemote` optional: give object as options for remote db constructor.
- `this.optionsLocal` optional
- `this.single` string: give string if you want single doc, not list. this is the ID of the doc. default to undefined.
- `this.dataDefault` optional: give array as default data, or object if single. default to `[]` if not single and `{}` if single.
- `this.sortData` optional: function that will be called whenever there is any changes to `this.data`. must be mutable to the data.

*/

var PouchyStore = /*#__PURE__*/function () {
  function PouchyStore() {
    (0, _classCallCheck2["default"])(this, PouchyStore);

    // set default options
    if (!('isUseData' in this)) {
      this.isUseData = true;
    }

    if (!('isUseRemote' in this)) {
      this.isUseRemote = true;
    }

    if (!('optionsLocal' in this)) {
      this.optionsLocal = {};
    }

    if (!('optionsRemote' in this)) {
      this.optionsRemote = {};
    }

    this.initializeProperties();
  }

  (0, _createClass2["default"])(PouchyStore, [{
    key: "initializeProperties",
    value: function initializeProperties() {
      // initialize in-memory data
      if (this.single) {
        this.data = this.dataDefault || {};
      } else if (this.isUseData) {
        this.data = this.dataDefault || [];
      }

      this.dataMeta = {
        // metadata of this store
        _id: ID_META_DOC,
        clientId: _PouchDB["default"].createId(),
        tsUpload: new Date(0).toJSON(),
        unuploadeds: {}
      };
      this.changeFromRemote = {}; // flag downloaded data from remote DB

      this.subscribers = []; // subscribers of data changes

      this.dbLocal = null;
      this.dbMeta = null;
      this.dbRemote = null;
    }
  }, {
    key: "initialize",
    value: function () {
      var _initialize = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var _this = this;

        var dataMetaOld, docs;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this.isInitialized) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return");

              case 2:
                if (this.name) {
                  _context.next = 4;
                  break;
                }

                throw new Error('store must have name');

              case 4:
                // initalize the databases
                this.dbLocal = new _PouchDB["default"](this.name, _objectSpread({
                  auto_compaction: true,
                  revs_limit: 2
                }, this.optionsLocal));
                this.dbMeta = new _PouchDB["default"]("".concat(PREFIX_META_DB).concat(this.name), {
                  auto_compaction: true,
                  revs_limit: 2
                });

                if (!this.isUseRemote) {
                  _context.next = 10;
                  break;
                }

                if (this.urlRemote) {
                  _context.next = 9;
                  break;
                }

                throw new Error("store's urlRemote should not be ".concat(this.urlRemote));

              case 9:
                this.dbRemote = new _PouchDB["default"]("".concat(this.urlRemote).concat(this.name), _objectSpread({}, this.optionsRemote));

              case 10:
                _context.next = 12;
                return this.dbMeta.getFailSafe(ID_META_DOC);

              case 12:
                dataMetaOld = _context.sent;

                if (!dataMetaOld) {
                  _context.next = 17;
                  break;
                }

                this.dataMeta = dataMetaOld;
                _context.next = 22;
                break;

              case 17:
                _context.next = 19;
                return this.persistMeta();

              case 19:
                _context.next = 21;
                return this.dbMeta.getFailSafe(ID_META_DOC);

              case 21:
                this.dataMeta = _context.sent;

              case 22:
                this.watchMeta();

                if (!this.isUseRemote) {
                  _context.next = 36;
                  break;
                }

                _context.prev = 24;
                _context.next = 27;
                return (0, _checkInternet["default"])(this.urlRemote);

              case 27:
                _context.next = 29;
                return this.dbLocal.replicate.from(this.dbRemote, {
                  batch_size: 1000,
                  batches_limit: 2
                });

              case 29:
                _context.next = 34;
                break;

              case 31:
                _context.prev = 31;
                _context.t0 = _context["catch"](24);
                console.e(_context.t0);

              case 34:
                _context.next = 36;
                return this.initUnuploadeds();

              case 36:
                _context.next = 38;
                return this.dbLocal.getDocs();

              case 38:
                docs = _context.sent;

                if (this.single) {
                  this.data = docs.find(function (doc) {
                    return doc._id === _this.single;
                  }) || this.data;
                } else if (this.isUseData) {
                  this.data = docs.filter(function (doc) {
                    return !('deletedAt' in doc) || doc.deletedAt === null;
                  });
                  this.sortData(this.data);
                  this.data = this.filterData(this.data);
                }

                this.isInitialized = true;

                if (this.single || this.isUseData) {
                  this.notifySubscribers(this.data);
                } else {
                  this.notifySubscribers(docs);
                }

                this.watchRemote();
                this.watchLocal();

              case 44:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[24, 31]]);
      }));

      function initialize() {
        return _initialize.apply(this, arguments);
      }

      return initialize;
    }()
  }, {
    key: "deinitialize",
    value: function () {
      var _deinitialize = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.unwatchMeta();
                this.unwatchLocal();
                this.unwatchRemote();
                _context2.next = 5;
                return this.dbLocal.close();

              case 5:
                _context2.next = 7;
                return this.dbMeta.close();

              case 7:
                if (!this.dbRemote) {
                  _context2.next = 10;
                  break;
                }

                _context2.next = 10;
                return this.dbRemote.close();

              case 10:
                this.initializeProperties();
                this.isInitialized = false;

              case 12:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function deinitialize() {
        return _deinitialize.apply(this, arguments);
      }

      return deinitialize;
    }()
  }, {
    key: "updateMemory",
    value: function updateMemory(doc) {
      if (!this.isUseData) return;

      if (this.single) {
        if (doc._id === this.single) {
          this.data = doc;
        }
      } else {
        var isDeleted = doc.deletedAt || doc._deleted;
        var index = this.data.findIndex(function (item) {
          return item._id === doc._id;
        });

        if (index !== -1) {
          if (isDeleted) {
            this.data.splice(index, 1);
          } else {
            this.data[index] = doc;
          }
        } else {
          if (isDeleted) {// do nothing
          } else {
            this.data.push(doc);
          }
        }

        this.sortData(this.data);
        this.data = this.filterData(this.data);
      }
    }
  }, {
    key: "sortData",
    value: function sortData(data) {// do no sorting, override this method to sort
    }
  }, {
    key: "filterData",
    value: function filterData(data) {
      return data; //do no filter, override this method to filter
    }
  }, {
    key: "persistMeta",
    value: function () {
      var _persistMeta = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                _context3.next = 3;
                return this.dbMeta.put(this.dataMeta);

              case 3:
                _context3.next = 8;
                break;

              case 5:
                _context3.prev = 5;
                _context3.t0 = _context3["catch"](0);
                console.e(_context3.t0);

              case 8:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[0, 5]]);
      }));

      function persistMeta() {
        return _persistMeta.apply(this, arguments);
      }

      return persistMeta;
    }()
  }, {
    key: "initUnuploadeds",
    value: function () {
      var _initUnuploadeds = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
        var replicationId, replicationDoc, unuploadeds, _iterator, _step, result, doc;

        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (this.isUseRemote) {
                  _context4.next = 2;
                  break;
                }

                return _context4.abrupt("return");

              case 2:
                _context4.prev = 2;
                _context4.t0 = this.replicationId;

                if (_context4.t0) {
                  _context4.next = 8;
                  break;
                }

                _context4.next = 7;
                return (0, _generateReplicationId["default"])(this.dbLocal, this.dbRemote, {});

              case 7:
                _context4.t0 = _context4.sent;

              case 8:
                replicationId = _context4.t0;
                _context4.next = 11;
                return this.dbLocal.get(replicationId);

              case 11:
                replicationDoc = _context4.sent;
                _context4.next = 14;
                return this.dbLocal.changes({
                  since: replicationDoc.last_seq,
                  include_docs: true
                });

              case 14:
                unuploadeds = _context4.sent;
                _iterator = _createForOfIteratorHelper(unuploadeds.results);

                try {
                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
                    result = _step.value;
                    doc = result.doc;
                    this.dataMeta.unuploadeds[doc._id] = true;
                  }
                } catch (err) {
                  _iterator.e(err);
                } finally {
                  _iterator.f();
                }

                if (unuploadeds.results.length > 0) {
                  this.persistMeta();
                }

                _context4.next = 23;
                break;

              case 20:
                _context4.prev = 20;
                _context4.t1 = _context4["catch"](2);
                console.e(_context4.t1);

              case 23:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[2, 20]]);
      }));

      function initUnuploadeds() {
        return _initUnuploadeds.apply(this, arguments);
      }

      return initUnuploadeds;
    }()
    /* watch manager for local DB and remote DB */

  }, {
    key: "watchRemote",
    value: function watchRemote() {
      var _this2 = this;

      if (!this.isUseRemote) return;
      this.handlerRemoteChange = this.dbLocal.replicate.from(this.dbRemote, {
        live: true,
        retry: true
      }).on('change', function (change) {
        var _iterator2 = _createForOfIteratorHelper(change.docs),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var doc = _step2.value;
            _this2.changeFromRemote[doc._id] = true;

            _this2.updateMemory(doc);
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }

        _this2.notifySubscribers(change.docs);
      }).on('error', function (err) {
        console.e("".concat(_this2.name, ".from"), 'error', err);
      });
    }
  }, {
    key: "unwatchRemote",
    value: function unwatchRemote() {
      if (this.handlerRemoteChange) {
        this.handlerRemoteChange.cancel();
      }
    }
  }, {
    key: "watchLocal",
    value: function watchLocal() {
      var _this3 = this;

      this.handlerLocalChange = this.dbLocal.changes({
        since: 'now',
        live: true,
        include_docs: true
      }).on('change', function (change) {
        var doc = change.doc;

        if (_this3.changeFromRemote[doc._id]) {
          delete _this3.changeFromRemote[doc._id];
        } else {
          _this3.updateMemory(doc);

          if (doc._deleted) {
            delete _this3.dataMeta.unuploadeds[doc._id];

            _this3.persistMeta();
          } else if (doc.dirtyBy && doc.dirtyBy.clientId === _this3.dataMeta.clientId) {
            _this3.dataMeta.unuploadeds[doc._id] = true;

            _this3.persistMeta();
          }

          _this3.notifySubscribers([doc]);
        }
      }).on('error', function (err) {
        console.e("".concat(_this3.name, ".changes"), 'error', err);
      });
    }
  }, {
    key: "unwatchLocal",
    value: function unwatchLocal() {
      if (this.handlerLocalChange) {
        this.handlerLocalChange.cancel();
      }
    }
  }, {
    key: "watchMeta",
    value: function watchMeta() {
      var _this4 = this;

      this.handlerMetaChange = this.dbMeta.changes({
        since: 'now',
        live: true,
        include_docs: true
      }).on('change', function (change) {
        var doc = change.doc;
        if (doc._id !== ID_META_DOC) return;
        _this4.dataMeta = doc;
      }).on('error', function (err) {
        console.e("".concat(PREFIX_META_DB).concat(_this4.name, ".changes"), 'error', err);
      });
    }
  }, {
    key: "unwatchMeta",
    value: function unwatchMeta() {
      if (this.handlerMetaChange) {
        this.handlerMetaChange.cancel();
      }
    }
    /* data upload (from local DB to remote DB) */

  }, {
    key: "checkIsUploaded",
    value: function checkIsUploaded(doc) {
      return !(doc._id in this.dataMeta.unuploadeds);
    }
  }, {
    key: "countUnuploadeds",
    value: function countUnuploadeds() {
      var keys = Object.keys(this.dataMeta.unuploadeds);
      return keys.length;
    }
  }, {
    key: "upload",
    value: function () {
      var _upload = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
        var result, ids, _i, _ids, id;

        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (this.isUseRemote) {
                  _context5.next = 2;
                  break;
                }

                return _context5.abrupt("return");

              case 2:
                _context5.next = 4;
                return (0, _checkInternet["default"])(this.urlRemote);

              case 4:
                _context5.next = 6;
                return this.dbLocal.replicate.to(this.dbRemote);

              case 6:
                result = _context5.sent;
                console.e(result, this.dataMeta);
                ids = Object.keys(this.dataMeta.unuploadeds);

                for (_i = 0, _ids = ids; _i < _ids.length; _i++) {
                  id = _ids[_i];
                  delete this.dataMeta.unuploadeds[id];
                }

                this.dataMeta.tsUpload = new Date().toJSON();
                this.persistMeta();
                this.notifySubscribers([]);

              case 13:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function upload() {
        return _upload.apply(this, arguments);
      }

      return upload;
    }()
    /* manipulation of array data (non-single) */

  }, {
    key: "addItem",
    value: function () {
      var _addItem = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(payload) {
        var user,
            id,
            _args6 = arguments;
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                user = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : null;
                id = this.dbLocal.createId();
                _context6.next = 4;
                return this.addItemWithId(id, payload, user);

              case 4:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function addItem(_x) {
        return _addItem.apply(this, arguments);
      }

      return addItem;
    }()
  }, {
    key: "addItemWithId",
    value: function () {
      var _addItemWithId = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(id, payload) {
        var user,
            now,
            actionBy,
            _args7 = arguments;
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                user = _args7.length > 2 && _args7[2] !== undefined ? _args7[2] : {};
                now = new Date().toJSON();
                actionBy = this.createActionBy(user);
                _context7.next = 5;
                return this.dbLocal.put(_objectSpread(_objectSpread({}, payload), {}, {
                  _id: id,
                  dirtyAt: now,
                  dirtyBy: actionBy,
                  createdAt: now,
                  createdBy: actionBy,
                  deletedAt: null
                }));

              case 5:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function addItemWithId(_x2, _x3) {
        return _addItemWithId.apply(this, arguments);
      }

      return addItemWithId;
    }()
  }, {
    key: "editItem",
    value: function () {
      var _editItem = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(id, payload) {
        var user,
            now,
            actionBy,
            doc,
            _args8 = arguments;
        return _regenerator["default"].wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                user = _args8.length > 2 && _args8[2] !== undefined ? _args8[2] : {};
                now = new Date().toJSON();
                actionBy = this.createActionBy(user);
                _context8.next = 5;
                return this.dbLocal.getFailSafe(id);

              case 5:
                doc = _context8.sent;

                if (doc) {
                  _context8.next = 8;
                  break;
                }

                return _context8.abrupt("return");

              case 8:
                _context8.next = 10;
                return this.dbLocal.put(_objectSpread(_objectSpread(_objectSpread({}, doc), payload), {}, {
                  dirtyAt: now,
                  dirtyBy: actionBy,
                  updatedAt: now,
                  updatedBy: actionBy
                }));

              case 10:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function editItem(_x4, _x5) {
        return _editItem.apply(this, arguments);
      }

      return editItem;
    }()
  }, {
    key: "deleteItem",
    value: function () {
      var _deleteItem = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(id) {
        var user,
            now,
            actionBy,
            doc,
            isRealDelete,
            _args9 = arguments;
        return _regenerator["default"].wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                user = _args9.length > 1 && _args9[1] !== undefined ? _args9[1] : {};
                now = new Date().toJSON();
                actionBy = this.createActionBy(user);
                _context9.next = 5;
                return this.dbLocal.getFailSafe(id);

              case 5:
                doc = _context9.sent;

                if (doc) {
                  _context9.next = 8;
                  break;
                }

                return _context9.abrupt("return");

              case 8:
                isRealDelete = doc.deletedAt || doc.createdAt > this.dataMeta.tsUpload;

                if (!isRealDelete) {
                  _context9.next = 14;
                  break;
                }

                _context9.next = 12;
                return this.dbLocal.remove(doc);

              case 12:
                _context9.next = 16;
                break;

              case 14:
                _context9.next = 16;
                return this.dbLocal.put(_objectSpread(_objectSpread({}, doc), {}, {
                  dirtyAt: now,
                  dirtyBy: actionBy,
                  deletedAt: now,
                  deletedBy: actionBy
                }));

              case 16:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function deleteItem(_x6) {
        return _deleteItem.apply(this, arguments);
      }

      return deleteItem;
    }()
  }, {
    key: "checkIdExist",
    value: function () {
      var _checkIdExist = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(id) {
        var doc;
        return _regenerator["default"].wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return this.dbLocal.getFailSafe(id);

              case 2:
                doc = _context10.sent;

                if (doc) {
                  _context10.next = 7;
                  break;
                }

                return _context10.abrupt("return", false);

              case 7:
                return _context10.abrupt("return", true);

              case 8:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function checkIdExist(_x7) {
        return _checkIdExist.apply(this, arguments);
      }

      return checkIdExist;
    }()
  }, {
    key: "createActionBy",
    value: function createActionBy(user) {
      user = _objectSpread({}, user);
      delete user._id;
      delete user._rev;

      for (var _i2 = 0, _arr = ['created', 'updated', 'deleted', 'dirty']; _i2 < _arr.length; _i2++) {
        var name = _arr[_i2];
        delete user["".concat(name, "At")];
        delete user["".concat(name, "By")];
      }

      user.clientId = this.dataMeta.clientId;
      return user;
    }
    /* manipulation of single data (non-array) */

  }, {
    key: "editSingle",
    value: function () {
      var _editSingle = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(payload) {
        var doc;
        return _regenerator["default"].wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.next = 2;
                return this.dbLocal.getFailSafe(this.single);

              case 2:
                _context11.t0 = _context11.sent;

                if (_context11.t0) {
                  _context11.next = 5;
                  break;
                }

                _context11.t0 = {
                  _id: this.single
                };

              case 5:
                doc = _context11.t0;
                _context11.next = 8;
                return this.dbLocal.put(_objectSpread(_objectSpread({}, doc), payload));

              case 8:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function editSingle(_x8) {
        return _editSingle.apply(this, arguments);
      }

      return editSingle;
    }()
  }, {
    key: "deleteSingle",
    value: function () {
      var _deleteSingle = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12() {
        var doc, payload;
        return _regenerator["default"].wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                _context12.next = 2;
                return this.dbLocal.getFailSafe(this.single);

              case 2:
                _context12.t0 = _context12.sent;

                if (_context12.t0) {
                  _context12.next = 5;
                  break;
                }

                _context12.t0 = {
                  _id: this.single
                };

              case 5:
                doc = _context12.t0;
                payload = {};

                if (doc._rev) {
                  payload._rev = doc._rev;
                  Object.assign(payload, this.dataDefault || {});
                }

                _context12.next = 10;
                return this.dbLocal.put(_objectSpread({
                  _id: doc._id
                }, payload));

              case 10:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function deleteSingle() {
        return _deleteSingle.apply(this, arguments);
      }

      return deleteSingle;
    }()
    /* subscription manager */

  }, {
    key: "subscribe",
    value: function subscribe(subscriber) {
      var _this5 = this;

      var index = this.subscribers.findIndex(function (item) {
        return item === subscriber;
      });
      if (index !== -1) return;
      this.subscribers.push(subscriber);
      return function () {
        return _this5.unsubscribe(subscriber);
      };
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe(subscriber) {
      var index = this.subscribers.findIndex(function (item) {
        return item === subscriber;
      });
      if (index === -1) return;
      this.subscribers.splice(index, 1);
    }
  }, {
    key: "notifySubscribers",
    value: function notifySubscribers(docs) {
      if (!this.isInitialized) return;

      if (this.isUseData) {
        // create new array/object reference
        if (this.single) {
          this.data = _objectSpread({}, this.data);
        } else {
          this.data = Array.from(this.data);
        }
      }

      var _iterator3 = _createForOfIteratorHelper(this.subscribers),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var subscriber = _step3.value;

          try {
            subscriber(docs);
          } catch (err) {
            console.e(err);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  }]);
  return PouchyStore;
}();

exports["default"] = PouchyStore;