"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Languages = exports.TranslateNames = exports.SPLIT_ENTER_REG = exports.SPLIT_ENTER = exports.SPLIT_STR = exports.JOIN_STR = void 0;
exports.JOIN_STR = '\n';
exports.SPLIT_STR = '\n';
exports.SPLIT_ENTER = '9999999999999';
exports.SPLIT_ENTER_REG = new RegExp(exports.SPLIT_ENTER.split('').join('\\s?'), 'g');
var TranslateNames;
(function (TranslateNames) {
    TranslateNames["BING"] = "baidu";
    TranslateNames["BAIDU"] = "baidu";
    TranslateNames["IFLYREC"] = "iflyrec";
})(TranslateNames = exports.TranslateNames || (exports.TranslateNames = {}));
var Languages;
(function (Languages) {
    /**
     * 汉语
     */
    Languages["ZH"] = "zh";
    /**
     * 英语
     */
    Languages["EN"] = "en";
    /**
     * 俄语
     */
    Languages["RU"] = "ru";
    /**
     * 日语
     */
    Languages["JP"] = "jp";
    /**
     * 韩语
     */
    Languages["KOR"] = "kor";
    /**
     * 法语
     */
    Languages["FRA"] = "fra";
    /**
     * 德语
     */
    Languages["DE"] = "de";
})(Languages = exports.Languages || (exports.Languages = {}));
