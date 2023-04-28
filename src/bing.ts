import qs from 'qs'
import axios from 'axios'
import FormData from 'form-data'
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
    const { data: body } = await axios.get(config.url, { headers: getHostHeaders(config.url) })
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

      const form = new FormData()
      form.append('to', to)
      form.append('key', key)
      form.append('text', text)
      form.append('token', token)
      form.append('fromLang', fromLang)

      const headers = getApiHeaders(config.url)
      const url = `${config.translator}?isVertical=1&IG=${ig}&IID=${iid}${count + 1}`
      const json = { text, key, token, to, fromLang }
      const { data } = (await axios({ method: 'post', url, data: qs.stringify(json), headers })) as any
      const [{ translations }] = data
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
