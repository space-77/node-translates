"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.getToken = exports.getHostInfo = exports.getHeaders = exports.getApiHeaders = exports.getHostHeaders = void 0;
const cheerio_1 = require("cheerio");
const config = {
    tk: null,
    firstTime: new Date().getTime(),
    queryCount: 0,
    url: 'https://cn.bing.com/Translator',
    translator: 'https://cn.bing.com/ttranslatev3'
};
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.56';
function getHostHeaders(url) {
    const { origin } = new URL(url);
    return {
        Origin: origin,
        Referer: url,
        'User-Agent': userAgent
    };
}
exports.getHostHeaders = getHostHeaders;
function getApiHeaders(url) {
    const { origin, hostname } = new URL(url);
    return {
        Host: hostname,
        Origin: origin,
        Referer: url,
        'User-Agent': userAgent,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    };
}
exports.getApiHeaders = getApiHeaders;
const getHeaders = (hostUrl, ifApi = false) => {
    const url = new URL(hostUrl);
    // const { if_api = false, if_referer_for_host = true, if_ajax_for_api = true, if_json_for_api = false } = config
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.56';
    let hostHeaders = {
        Origin: url.origin,
        Referer: hostUrl,
        'User-Agent': userAgent
    };
    let apiHeaders = {
        Host: url.hostname,
        Origin: url.origin,
        Referer: 'https://cn.bing.com/translator?ref=TThis&from=en&to=zh-Hans&isTTRefreshQuery=1',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': userAgent
    };
    // if (ifApi && !if_ajax_for_api) {
    //   delete apiHeaders["X-Requested-With"];
    //   // apiHeaders.remove('X-Requested-With');
    //   apiHeaders["Content-Type"] = "text/plain";
    // }
    // if (ifApi && if_json_for_api) {
    //   apiHeaders["Content-Type"] = "application/json";
    // }
    return !ifApi ? hostHeaders : apiHeaders;
};
exports.getHeaders = getHeaders;
const getHostInfo = (hostHtml) => {
    const $ = (0, cheerio_1.load)(hostHtml);
    let iid = `${$($('[id="rich_tta"]')).attr('data-iid')}.`;
    let [, ig] = hostHtml.match('IG:"(.*?)"') ?? [];
    return { iid, ig };
};
exports.getHostInfo = getHostInfo;
function getToken(host_html) {
    let [, result_str] = host_html.match('var params_RichTranslateHelper = (.*?);') ?? [];
    let result = eval(result_str);
    return { key: result[0], token: result[1] };
}
exports.getToken = getToken;
const sleep = async (seconds) => {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
};
exports.sleep = sleep;
exports.default = config;
