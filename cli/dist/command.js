"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _commander = require("commander");

var _inquirer = require("inquirer");

var _inquirerAutocompletePrompt = _interopRequireDefault(require("inquirer-autocomplete-prompt"));

var _moment = _interopRequireDefault(require("moment"));

var _db = _interopRequireDefault(require("./db"));

var _writer = require("./writer");

(0, _inquirer.registerPrompt)('autocomplete', _inquirerAutocompletePrompt["default"]);

_commander.program.version('0.0.1').description('An Offline-First Task Manager');

_commander.program.command('show-task').alias('s').description('Show all task').option('--incomplete', 'Show incomplete task').option('--completed', 'Show completed task').action( /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(cmd) {
    var data, col;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _db["default"].initialize();

          case 2:
            data = _db["default"].allTask(cmd.incomplete ? 'incomplete' : cmd.completed ? 'completed' : '').map(function (task) {
              var createdAt = task.createdAt,
                  content = task.content,
                  tags = task.tags,
                  isCompleted = task.isCompleted;
              return {
                createdAt: createdAt,
                content: content,
                tags: tags,
                isCompleted: isCompleted,
                isSync: _db["default"].checkIsUploaded(task)
              };
            });
            col = [16, 32, 20, 11, 6];
            console.log((0, _writer.drawTable)(data, col));
            console.log('Last sync: ' + (0, _moment["default"])(_db["default"].dataMeta.tsUpload).fromNow());
            _context.next = 8;
            return _db["default"].deinitialize();

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());

_commander.program.command('mark-complete').alias('m').description('Complete a task').action( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
  var tasks, _yield$prompt, taskContent;

  return _regenerator["default"].wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return _db["default"].initialize();

        case 2:
          tasks = _db["default"].allTask('incomplete');

          if (tasks.length) {
            _context3.next = 7;
            break;
          }

          _context3.next = 6;
          return _db["default"].deinitialize();

        case 6:
          return _context3.abrupt("return", console.log("You don't have any incomplete task."));

        case 7:
          _context3.next = 9;
          return (0, _inquirer.prompt)([{
            type: 'autocomplete',
            name: 'taskContent',
            message: 'Select a task to complete',
            source: function source(answersSoFar, input) {
              return new Promise( /*#__PURE__*/function () {
                var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(resolve) {
                  return _regenerator["default"].wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          resolve(tasks.map(function (el) {
                            return el.tags.length ? "".concat(el.content, " | ").concat(el.tags.join(', ')) : el.content;
                          }).filter(function (el) {
                            return el.includes(input || '');
                          }));

                        case 1:
                        case "end":
                          return _context2.stop();
                      }
                    }
                  }, _callee2);
                }));

                return function (_x2) {
                  return _ref3.apply(this, arguments);
                };
              }());
            }
          }]);

        case 9:
          _yield$prompt = _context3.sent;
          taskContent = _yield$prompt.taskContent;
          taskContent = taskContent.split(' | ')[0];
          _context3.next = 14;
          return _db["default"].markComplete(taskContent);

        case 14:
          _context3.next = 16;
          return _db["default"].deinitialize();

        case 16:
          console.log("Task \"".concat(taskContent, "\" completed"));

        case 17:
        case "end":
          return _context3.stop();
      }
    }
  }, _callee3);
})));

_commander.program.command('sync').alias('sy').description('Sync local data to server').action( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
  var unUploadedCount;
  return _regenerator["default"].wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return _db["default"].initialize();

        case 2:
          unUploadedCount = _db["default"].countUnuploadeds();
          _context4.prev = 3;
          _context4.next = 6;
          return _db["default"].upload();

        case 6:
          console.log("".concat(unUploadedCount, " task(s) synchronized"));
          _context4.next = 12;
          break;

        case 9:
          _context4.prev = 9;
          _context4.t0 = _context4["catch"](3);
          console.log('Network is offline. Please check your internet connection.');

        case 12:
          _context4.next = 14;
          return _db["default"].deinitialize();

        case 14:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee4, null, [[3, 9]]);
})));

_commander.program.parse(process.argv);