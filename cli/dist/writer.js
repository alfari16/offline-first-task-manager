"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.drawTable = void 0;

var _moment = _interopRequireDefault(require("moment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var addSpace = function addSpace(text, space) {
  return "".concat(text).concat(' '.repeat(space)).substring(0, space);
};

var drawLine = function drawLine(col) {
  return '-'.repeat(col.reduce(function (prev, curr) {
    return prev + curr + 3;
  }, 1));
};

var drawTable = function drawTable(data, col) {
  var result = drawLine(col) + '\n';
  result += "| ".concat(addSpace('createdAt', col[0]), " | ").concat(addSpace('content', col[1]), " | ").concat(addSpace('tags', col[2]), " | ").concat(addSpace('isCompleted', col[3]), " | ").concat(addSpace('isSync', col[4]), " |\n");
  result += drawLine(col) + '\n';
  data.forEach(function (_ref) {
    var createdAt = _ref.createdAt,
        content = _ref.content,
        tags = _ref.tags,
        isCompleted = _ref.isCompleted,
        isSync = _ref.isSync;
    result += "| ".concat(addSpace((0, _moment["default"])(createdAt).format('YYYY-MM-DD HH:mm'), col[0]), " | ").concat(addSpace(content, col[1]), " | ").concat(addSpace(tags.join(', '), col[2]), " | ").concat(addSpace(isCompleted.toString(), col[3]), " | ").concat(addSpace(isSync.toString(), col[4]), " |") + '\n';
  });
  result += drawLine(col);
  return result;
};

exports.drawTable = drawTable;