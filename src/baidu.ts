import client from './client'
import { load } from 'cheerio'
import config, { getApiHeaders, getHostHeaders } from './common'
import { JOIN_STR, SPLIT_STR } from './config'

const URL_BASE = 'https://fanyi.baidu.com'
const URL_LINK = `${URL_BASE}/translate`
const URL_TRANSLATOR = `${URL_BASE}/v2transapi`
const URL_WEB_STATIC = 'https://fanyi-cdn.cdn.bcebos.com/webStatic/translation/js'
const GET_SIGN_PATTERN = new RegExp(`${URL_WEB_STATIC}/index(.*?).js`)
const GET_SIGN_OLD_URL = `${URL_WEB_STATIC}/index.5e400555.js`
const HOST_HEADERS = getHostHeaders(URL_BASE)

class Baidu {
  static gtk: string
  static token: string
  static signJsCode: string
  static getSignUrl: string | undefined

  static async getAuthInfo(text: string) {
    let sign = ''
    const { signJsCode, gtk, token } = Baidu
    if (!signJsCode || !token || !gtk) {
      await client.get(URL_LINK, { headers: HOST_HEADERS }) // 第一次请求不没有cookie，这次请求只是为了那到 cookie
      const { body } = await client.get(URL_LINK, { headers: HOST_HEADERS }) // 第二次请求是携带 cookie 的

      const signHtml = await Baidu.getSignHtml(body)
      // this.setSignJsCode(signHtml)
      const { sign: s, token, gtk } = Baidu.getHostInfo(body, signHtml, text)
      sign = s
      Baidu.gtk = gtk
      Baidu.token = token
    } else {
      sign = this.getSign(text, Baidu.gtk)
    }
    return { sign, token: Baidu.token }
  }

  static checkQueryText(texts: string | string[], { ifIgnoreLimitOfLength = false, limitOfLength = 5000 }) {
    let text = Array.isArray(texts) ? texts.map(i => i.trim()).join(JOIN_STR) : texts
    text = text.trim()
    if (text.length === 0) return ''
    let length = text.length
    if (length >= limitOfLength && !ifIgnoreLimitOfLength) {
      throw new Error('The length of the text to be translated exceeds the limit.')
    } else {
      if (length >= limitOfLength) {
        console.warn(`The translation ignored the excess[above ${limitOfLength}]. Length of text is ${length}.`)
        console.warn('The translation result will be incomplete.')
        return text.substring(0, limitOfLength - 1)
      }
    }
    return text
  }

  static async getSignHtml(html: string) {
    try {
      if (!Baidu.getSignUrl) {
        Baidu.getSignUrl = html.match(GET_SIGN_PATTERN)?.[0]
      }
      if (!Baidu.getSignUrl) return await this.agetSignOld()

      const { body } = await client.get(Baidu.getSignUrl!, { headers: HOST_HEADERS })
      return body
    } catch (error) {
      return await this.agetSignOld()
    }
  }

  static async agetSignOld() {
    try {
      const { body } = await client.get(GET_SIGN_OLD_URL, { headers: HOST_HEADERS })
      Baidu.getSignUrl = GET_SIGN_OLD_URL
      return body
    } catch (error) {
      return Promise.reject(error)
    }
  }

  static setSignJsCode(signHtml: string) {
    const signReg = /function\(t\)\{(.*?2147483647.*?)\}$/
    const codeList = signHtml.replace(/,\d+:function/g, '__====___===:function').split('__====___===:')
    const signJsCode = codeList.find(code => signReg.test(code))
    if (signJsCode) {
      Baidu.signJsCode = RegExp.$1.replace('t.exports=function(t)', 'function f(t, r)')
    }
  }

  static getSign(tsText: string, gtk: string) {
    const jsCode = `${Baidu.signJsCode}; f('${tsText}', '${gtk}');`
    return eval(jsCode)
  }

  static getHostInfo(hostHtml: string, signHtml: string, queryText: string) {
    this.setSignJsCode(signHtml)
    const [, gtk] = hostHtml.match('window.gtk = "(.*?)";') ?? []
    const sign = this.getSign(queryText, gtk)
    const [, token] = hostHtml.match(/token:\s*'(\S+)'/) ?? []
    return { gtk, sign, token }
  }
}

export type BaiduOptions = { ifIgnoreLimitOfLength?: boolean; limitOfLength?: number }

export default async function baiduTranslator(texts: string | string[], options: BaiduOptions = {}) {
  const text = Baidu.checkQueryText(texts, options)
  const { sign, token } = await Baidu.getAuthInfo(text)

  const form = {
    to: 'en',
    sign,
    from: 'zh',
    token,
    query: text,
    transtype: 'translang', //# ["translang", "realtime"]
    simple_means_flag: '3',
    domain: 'common'
  }

  const res = await client.post(`${URL_TRANSLATOR}?from=zh&to=en`, { headers: getApiHeaders(URL_BASE), form }).json()
  const textEn = (res as any).trans_result.data[0].dst as string
  return textEn.split(SPLIT_STR).map(i => i.trim())
}
