import client from './client'
import { WaitList } from './collect'
import { restoreEnter } from './utils'
import { JOIN_STR, Languages, SPLIT_ENTER, SPLIT_STR } from './config'
import config, { getApiHeaders, getHostHeaders, getHostInfo, getToken } from './common'

type BingAuth = { ig: string; iid: string; key: string; token: string; count: 0 }

class Bing {
  static authInfo: BingAuth | null = null

  static async getAuthInfo() {
    const { authInfo } = Bing
    if (authInfo) return authInfo
    const { body } = await client.get(config.url, { headers: getHostHeaders(config.url) })
    const { ig, iid } = getHostInfo(body)
    const { key, token } = getToken(body)
    Bing.authInfo = { ig, iid, key, token, count: 0 }
    return Bing.authInfo
  }
}

function getLanguage(language: Languages) {
  switch (language) {
    case Languages.ZH:
      return 'zh-Hans'
    case Languages.EN:
      return 'en'
    case Languages.RU:
      return 'ru'
    case Languages.JP:
      return 'ja'
    case Languages.KOR:
      return 'ko'
    case Languages.DE:
      return 'de'
    case Languages.FRA:
      return 'fr'
  }
}

// export default async function bingTranslator(texts: string | string[]) {
export default async function bingTranslator(dataList: [string, WaitList[]][]) {
  const proms = dataList.map(async ([fromTo, value]) => {
    try {
      const { ig, iid, key, token, count } = await Bing.getAuthInfo()
      const text = value.map(i => i.text.replace(/\r?\n/g, SPLIT_ENTER)).join(JOIN_STR)
      const [fromLang, to] = fromTo.split('_').map(i => getLanguage(i as Languages))
      const form = { text, key, token, to, fromLang }
      const options = { headers: getApiHeaders(config.url), form }
      const url = `${config.translator}?isVertical=1&IG=${ig}&IID=${iid}${count + 1}`
      const [{ translations }] = (await client.post(url, options).json()) as any[]
      Bing.authInfo!.count++
      const textEn = translations[0].text as string
      textEn.split(SPLIT_STR).map((i, index) => {
        const textItem = value[index]
        textItem.resolve({ text: restoreEnter(textItem.text), dst: restoreEnter(i) })
      })
    } catch (error) {
      console.error(error)
      throw new Error('translate fail')
    }
  })
  await Promise.all(proms)
}
