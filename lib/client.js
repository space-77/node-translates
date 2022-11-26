"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieJar = void 0;
const got_cjs_1 = __importDefault(require("got-cjs"));
const tough_cookie_1 = require("tough-cookie");
exports.cookieJar = new tough_cookie_1.CookieJar();
exports.default = got_cjs_1.default.extend({ cookieJar: exports.cookieJar });
