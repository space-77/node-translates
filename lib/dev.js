"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
// import bingTranslator from './bing'
~(async () => {
    try {
        // t()//
        // bingTranslator.default
        const res = await (0, index_1.bingTranslator)(['你', '好', '沙漏', '湿巾', '绿萝', '口罩', '下班']);
        console.log(res);
    }
    catch (error) {
        console.error(error);
    }
})();
