import { JOIN_STR, SPLIT_ENTER } from './config'
import { WaitList } from './collect'
import { IBrowser, restoreEnter } from './utils'
import { sleep } from './common'

const URL_BASE = 'https://fanyi.baidu.com'
const URL_LINK = `${URL_BASE}/mtpe-individual/multimodal`
const URL_TRANSLATOR = `${URL_BASE}/ait/text/translate`

type PromsItem = { info: WaitList; dst: string }

export type BaiduOptions = { ifIgnoreLimitOfLength?: boolean; limitOfLength?: number }

export default async function baiduTranslator(dataList: [string, WaitList[]][]) {
  const browser = new IBrowser()
  await browser.init()

  const proms = dataList.map(([fromTo, value]) => {
    return new Promise<PromsItem[]>(async (resolve, reject) => {
      let timer: NodeJS.Timeout | undefined

      async function closePage(message: string | Error) {
        value.forEach(i => i.reject(message))
        clearTimeout(timer)
        reject(message)
      }

      timer = setTimeout(async () => {
        closePage('timeout')
      }, 1000 * 120)

      const texts = value.map(i => i.text.replace(/\r?\n/g, SPLIT_ENTER)).join(JOIN_STR)
      const url = `${URL_LINK}?lang=${fromTo.replace('_', '2')}&query=${texts}`
      const page = await browser.newPage()
      if (!page) {
        closePage('create tab err')
        return
      }

      page.on('response', async response => {
        const url = response.url()
        if (url.startsWith(URL_TRANSLATOR)) {
          try {
            await sleep(260)
            const resList: PromsItem[] = []
            const texts = await page.$eval('#trans-selection', el => {
              const texts: string[] = []
              el.querySelectorAll('div').forEach(el => texts.push(el.textContent ?? ''))
              return texts
            })
            texts.forEach((dst, index) => {
              resList.push({ info: value[index], dst })
            })
            clearTimeout(timer)
            resolve(resList)
          } catch (error) {
            console.error(error)
          }
        }
      })

      await page.goto(encodeURI(url))
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
