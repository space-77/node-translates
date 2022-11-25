import got from 'got-cjs'
import config, { getHeaders, getHostInfo, getToken, sleep } from './common'
import { CookieJar } from 'tough-cookie'

const cookieJar = new CookieJar()
const client = got.extend({ cookieJar })

async function init() {
  const { body } = await client.get(config.url, { cookieJar, headers: getHeaders(config.url) })

  const { ig, iid } = getHostInfo(body)
  const { key, token } = getToken(body)
  return { ig, iid, key, token }
}

export default async function bingTranslator(texts: string | string[]) {
  try {
    const { ig, iid, key, token } = await init()
    const text = Array.isArray(texts) ? texts.join('。。。') : texts

    const form = { text, key, token, to: 'en', fromLang: 'zh-Hans' }
    const options = { cookieJar, headers: getHeaders(config.url, true), form }
    const url = `${config.translator}?isVertical=1&IG=${ig}&IID=${iid}`
    const [{ translations }] = (await client.post(url, options).json()) as any[]
    const textEn = translations[0].text as string
    return textEn.split('...').map(i => i.trim())
  } catch (error) {
    console.error(error)
  }
}

