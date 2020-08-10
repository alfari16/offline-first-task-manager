"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var TIMEOUT_INTERNET_CHECK = 5; // seconds

var checkInternet = function checkInternet(url) {
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () {
      reject(new Error('No internet connection'));
    }, TIMEOUT_INTERNET_CHECK * 1000);

    _axios["default"].head(url).then(function () {
      clearTimeout(timer);
      resolve(true);
    })["catch"](function () {
      clearTimeout(timer);
      reject(new Error('No internet connection'));
    });
  });
};

var _default = checkInternet;
exports["default"] = _default;