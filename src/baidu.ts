import { JOIN_STR, SPLIT_ENTER } from './config'
import { WaitList } from './collect'
import { IBrowser, restoreEnter } from './utils'

const URL_BASE = 'https://fanyi.baidu.com'
const URL_LINK = `${URL_BASE}/translate`
const URL_TRANSLATOR = `${URL_BASE}/v2transapi`

type PromsItem = { info: WaitList; dst: string }

export type BaiduOptions = { ifIgnoreLimitOfLength?: boolean; limitOfLength?: number }

export default async function baiduTranslator(dataList: [string, WaitList[]][]) {
  const browser = new IBrowser()
  await browser.init()

  const proms = dataList.map(([fromTo, value]) => {
    return new Promise<PromsItem[]>(async (resolve, reject) => {
      const timer = setTimeout(async () => {
        reject('timeout')
      }, 1000 * 30)

      const resList: PromsItem[] = []
      const texts = value.map(i => i.text.replace(/\r?\n/g, SPLIT_ENTER)).join(JOIN_STR)
      const url = `${URL_LINK}#${fromTo.replace('_', '/')}`
      const page = await browser.newPage()
      if (!page) {
        reject('创建浏览器页签失败')
        value.forEach(i => i.reject('创建浏览器页签失败'))
        clearTimeout(timer)
        return
      }

      page.on('response', async response => {
        const url = response.url()
        if (url.startsWith(URL_TRANSLATOR)) {
          const data = (await response.json()) as any
          const dataList: any[] = data.trans_result.data ?? []
          dataList.forEach((info, index) => {
            resList.push({ info: value[index], dst: info.dst })
          })
          clearTimeout(timer)
          resolve(resList)
        }
      })
      await page.goto(encodeURI(url))

      page.waitForSelector('#baidu_translate_input').then(async () => {
        await page.type('#baidu_translate_input', texts)
        await page.keyboard.press('Enter')
      })
    })
  })

  const resList = await Promise.all(proms)
  resList.forEach(res => {
    res.forEach(({ info, dst }) => {
      info.resolve({ text: restoreEnter(info.text), dst: restoreEnter(dst) })
    })
  })
  await browser.close()
}
