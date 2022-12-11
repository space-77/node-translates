import { TextInfo } from './collect';
import { TranslateNames, Languages } from './config';
declare function bingTranslator(info: TextInfo): Promise<import("./collect").WaitResolve>;
declare function baiduTranslator(info: TextInfo): Promise<import("./collect").WaitResolve>;
declare function iflyrecTranslator(info: TextInfo): Promise<import("./collect").WaitResolve>;
export { bingTranslator, baiduTranslator, iflyrecTranslator, TextInfo, TranslateNames, Languages };
