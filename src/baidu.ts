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
  try {
    await browser.init()

    const proms = dataList.map(([fromTo, value]) => {
      return new Promise<PromsItem[]>(async (resolve, reject) => {
        let timer: NodeJS.Timeout | undefined

        async function closePage(message: string | Error) {
          await page.close()
          // await browser.close()
          value.forEach(i => i.reject(message))
          clearTimeout(timer)
          reject(message)
        }

        timer = setTimeout(async () => {
          closePage('timeout')
        }, 1000 * 120)

        const resList: PromsItem[] = []
        const texts = value.map(i => i.text.replace(/\r?\n/g, SPLIT_ENTER)).join(JOIN_STR)
        const url = `${URL_LINK}#${fromTo.replace('_', '/')}/${texts}`
        const page = await browser.newPage()
        if (!page) {
          closePage('create tab err')
          return
        }

        page.on('response', async response => {
          const url = response.url()
          if (url.startsWith(URL_TRANSLATOR)) {
            try {
              const data = (await response.json()) as any
              if (!data.trans_result) {
                closePage(data.errShowMsg ?? '')
              }
              const dataList: any[] = data.trans_result.data ?? []
              dataList.forEach((info, index) => {
                resList.push({ info: value[index], dst: info.dst })
              })
              clearTimeout(timer)
              resolve(resList)
            } catch (error) {
              // console.error('err------------123')
            }
            await page.close()
          }
        })

        // page.on('error', async err => {
        //   try {

        //     await closePage(err)
        //   } catch (error) {

        //   }
        // })

        await page.goto(encodeURI(url))

        // page.waitForSelector('#baidu_translate_input').then(async () => {
        //   const closeBtn = await page.$('.app-guide-close')
        //   await closeBtn?.click()
        //   setTimeout(async () => {
        //     await page.type('#baidu_translate_input', texts, { delay: 0 })
        //     await page.keyboard.press('Enter')
        //   }, 1000)
        // })
      })
    })

    const resList = await Promise.all(proms)
    resList.forEach(res => {
      res.forEach(({ info, dst }) => {
        info.resolve({ text: restoreEnter(info.text), dst: restoreEnter(dst) })
      })
    })
    await browser.close()
  } catch (error) {
    console.log('err----------------------')
    console.log('err----------------------')
    console.log('err----------------------')
  }

  // await new Promise((resolve, reject) => {
  //   setTimeout(async () => {
  //     await browser.close()
  //     resolve('')
  //   }, 1000 * 5)
  // })
}
