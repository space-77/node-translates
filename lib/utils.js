"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreEnter = exports.cutArray = exports.IBrowser = exports.getChromePath = void 0;
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const config_1 = require("./config");
const chromePaths = require('chrome-paths');
const { getEdgePath } = require('edge-paths');
function getChromePath() {
    const { chrome, chromium, chromeCanary } = chromePaths;
    const chromePath = chrome || getEdgePath() || chromium || chromeCanary;
    if (!chromePath) {
        throw new Error('没找到 chrome 或 chromium内核 的浏览器，请安装 chrome 或 chromium内核 的浏览器后重试');
    }
    return chromePath;
}
exports.getChromePath = getChromePath;
class IBrowser {
    constructor() {
        this.time = Date.now();
        this.useCount = 0;
        if (!IBrowser.instance)
            IBrowser.instance = this;
        return IBrowser.instance;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.useCount++;
            clearTimeout(this.closeTimer);
            if (!this.chrome) {
                if (this.initialize) {
                    yield this.initialize;
                    this.initialize = undefined;
                    return;
                }
                const chromePath = getChromePath();
                // this.initialize = puppeteer.launch({ executablePath: chromePath, headless: false })
                this.initialize = puppeteer_core_1.default.launch({ executablePath: chromePath });
                this.chrome = yield this.initialize;
                // this.chrome = await puppeteer.launch({ executablePath: chromePath, headless: false })
                // this.chrome = await puppeteer.launch({ executablePath: chromePath })
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log(this.useCount)
            this.useCount--;
            if (this.useCount <= 0) {
                clearTimeout(this.closeTimer);
                this.closeTimer = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const { chrome } = this;
                        if (!chrome)
                            throw new Error('chrome is not defined');
                        yield chrome.close();
                        this.chrome = null;
                        console.log('close done!!!');
                    }
                    catch (error) {
                        console.error(error);
                    }
                }), 500);
            }
        });
    }
    newPage() {
        return __awaiter(this, void 0, void 0, function* () {
            const chrome = this.chrome;
            if (!chrome)
                throw new Error('chrome is not defined');
            return yield chrome.newPage();
        });
    }
}
exports.IBrowser = IBrowser;
function cutArray(array, subLength) {
    let index = 0;
    let newArr = [];
    while (index < array.length) {
        newArr.push(array.slice(index, (index += subLength)));
    }
    return newArr;
}
exports.cutArray = cutArray;
function restoreEnter(text) {
    return text.replace(config_1.SPLIT_ENTER_REG, '\n');
}
exports.restoreEnter = restoreEnter;
