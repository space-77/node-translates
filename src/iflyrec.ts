import axios from 'axios'
import { getChromePath, restoreEnter } from './utils'
import { getApiHeaders } from './common'
import puppeteer, { Page, Browser } from 'puppeteer-core'
import { WaitList } from './collect'
import { Languages } from './config'

const URL_BASE = 'https://fanyi.iflyrec.com'
const URL_API = `${URL_BASE}/TranslationService/v1/textTranslation`

class IBrowser {
  page!: Page
  browser!: Browser

  async initBrowser() {
    const chromePath = getChromePath()

    this.browser = await puppeteer.launch({ executablePath: chromePath })
    this.page = await this.browser.newPage()
  }

  async init() {
    await this.page.goto(URL_BASE)
    const cookies = await this.page.cookies(URL_BASE)
    await this.browser?.close()
    return cookies
  }
}

class Iflyrec {
  static cookies: Record<string, string> = {}

  static async getCookies() {
    if (!Iflyrec.cookies) {
      const b = new IBrowser()
      await b.initBrowser()
      const cookies = await b.init()
      cookies.forEach(i => {
        const { name, value } = i
        Iflyrec.cookies[name] = value
      })
    }

    return Iflyrec.cookies
  }
}

function getLanguage(language: Languages) {
  switch (language) {
    case Languages.ZH:
      return '1'
    case Languages.EN:
      return '2'
    case Languages.JP:
      return 3
    case Languages.KOR:
      return 4
    case Languages.RU:
      return 5
    case Languages.FRA:
      return 6
    case Languages.DE:
      return 13
  }
}

// export default async function iflyrecTranslator(texts: string | string[]) {
export default async function iflyrecTranslator(dataList: [string, WaitList[]][]) {
  // const cookies = await Iflyrec.getCookies()

  const proms = dataList.map(async ([fromTo, value]) => {
    const contents = value.map(i => i.text)
    const [from, to] = fromTo.split('_').map(i => getLanguage(i as Languages))
    const json = { to, from, contents: contents.map(text => ({ frontBlankLine: 0, text })) }
    const headers = getApiHeaders(URL_BASE) as Record<string, string>
    headers['Content-Type'] = 'application/json; charset=UTF-8'
    // headers['Cookie'] = Object.entries(cookies)
    //   .map(([key, value]) => `${key}=${value}`)
    //   .join('; ')
    try {
      // 讯飞这个接口暂时不需要做验证
      const { data } = (await axios.post(`${URL_API}?t=${Date.now()}`, json, { headers })) as any
      if (data.code !== '000000') {
        value.forEach(i => i.reject(data.desc))
        throw new Error(data.desc)
      }
      const textEnList = (data as any).biz as { frontBlankLine: number; translateResult: string }[]
      textEnList.map(({ translateResult }, index) => {
        const textItem = value[index]
        textItem.resolve({ text: restoreEnter(textItem.text), dst: restoreEnter(translateResult) })
      })
    } catch (error) {
      console.error(error)
      value.forEach(i => i.reject('translate fail'))
    }
  })

  await Promise.all(proms)
}
