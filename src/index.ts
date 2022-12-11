import _bingTranslator from './bing'
import _baiduTranslator from './baidu'
import _iflyrecTranslator from './iflyrec'
import Collector, { TextInfo } from './collect'
import { TranslateNames, Languages } from './config'

const collector = new Collector()

function bingTranslator(info: TextInfo) {
  const key = TranslateNames.BING
  collector.createCollect(key, _bingTranslator, 500)
  return collector.addTranslate(info, key)
}
function baiduTranslator(info: TextInfo) {
  const key = TranslateNames.BAIDU
  collector.createCollect(key, _baiduTranslator, 1000)
  return collector.addTranslate(info, key)
}
function iflyrecTranslator(info: TextInfo) {
  const key = TranslateNames.IFLYREC
  collector.createCollect(key, _iflyrecTranslator)
  return collector.addTranslate(info, key)
}

export { bingTranslator, baiduTranslator, iflyrecTranslator, TextInfo, TranslateNames, Languages }
