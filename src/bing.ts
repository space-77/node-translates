import client from './client'
import { JOIN_STR, SPLIT_STR } from './config'
import config, { getApiHeaders, getHostHeaders, getHostInfo, getToken } from './common'

type BingAuth = { ig: string; iid: string; key: string; token: string }

class Bing {
  static authInfo: BingAuth | null = null

  static async getAuthInfo() {
    const { authInfo } = Bing
    if (authInfo) return authInfo
    const { body } = await client.get(config.url, { headers: getHostHeaders(config.url) })
    const { ig, iid } = getHostInfo(body)
    const { key, token } = getToken(body)
    Bing.authInfo = { ig, iid, key, token }
    return Bing.authInfo
  }
}

export default async function bingTranslator(texts: string | string[]) {
  texts = Array.isArray(texts) ? texts : [texts]
  const { ig, iid, key, token } = await Bing.getAuthInfo()
  const text = texts.join(JOIN_STR)

  const form = { text, key, token, to: 'en', fromLang: 'zh-Hans' }
  const options = { headers: getApiHeaders(config.url), form }
  const url = `${config.translator}?isVertical=1&IG=${ig}&IID=${iid}${config.queryCount++}`
  const [{ translations }] = (await client.post(url, options).json()) as any[]
  const textEn = translations[0].text as string
  return textEn.split(SPLIT_STR).map((i, index) => ({ zh: texts[index], en: i.trim() }))
}
