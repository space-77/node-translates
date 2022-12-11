"use strict";
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
    page;
    useCount = 0;
    static instance;
    chrome;
    constructor() {
        if (!IBrowser.instance)
            IBrowser.instance = this;
        this.useCount++;
        if (this.chrome)
            this.init();
        return IBrowser.instance;
    }
    async init() {
        if (!this.chrome) {
            const chromePath = getChromePath();
            // this.chrome = await puppeteer.launch({ executablePath: chromePath, headless: false })
            this.chrome = await puppeteer_core_1.default.launch({ executablePath: chromePath });
        }
    }
    async close() {
        this.useCount--;
        if (this.useCount <= 0) {
            try {
                await this.chrome?.close();
                this.chrome = null;
            }
            catch (error) {
                console.error(error);
            }
        }
    }
    async newPage() {
        const chrome = this.chrome;
        return await chrome?.newPage();
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
