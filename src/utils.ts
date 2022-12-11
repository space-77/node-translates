import puppeteer, { Browser } from 'puppeteer-core'
import { SPLIT_ENTER, SPLIT_ENTER_REG } from './config'

const chromePaths = require('chrome-paths')
const { getEdgePath } = require('edge-paths')

export function getChromePath() {
  const { chrome, chromium, chromeCanary } = chromePaths
  const chromePath = chrome || getEdgePath() || chromium || chromeCanary
  if (!chromePath) {
    throw new Error('没找到 chrome 或 chromium内核 的浏览器，请安装 chrome 或 chromium内核 的浏览器后重试')
  }

  return chromePath
}

export class IBrowser {
  protected time = Date.now()
  protected useCount = 0
  protected initialize?: Promise<Browser>
  protected static instance: IBrowser
  protected closeTimer?: NodeJS.Timeout
  chrome!: Browser | null

  constructor() {
    if (!IBrowser.instance) IBrowser.instance = this
    return IBrowser.instance
  }
  async init() {
    this.useCount++
    clearTimeout(this.closeTimer)
    if (!this.chrome) {
      if (this.initialize) {
        await this.initialize
        this.initialize = undefined
        return
      }
      const chromePath = getChromePath()
      // this.initialize = puppeteer.launch({ executablePath: chromePath, headless: false })
      this.initialize = puppeteer.launch({ executablePath: chromePath })
      this.chrome = await this.initialize
      // this.chrome = await puppeteer.launch({ executablePath: chromePath, headless: false })
      // this.chrome = await puppeteer.launch({ executablePath: chromePath })
    }
  }

  async close() {
    // console.log(this.useCount)
    this.useCount--
    if (this.useCount <= 0) {
      clearTimeout(this.closeTimer)
      this.closeTimer = setTimeout(async () => {
        try {
          const { chrome } = this
          if (!chrome) throw new Error('chrome is not defined')
          await chrome.close()
          this.chrome = null
          console.log('close done!!!')
        } catch (error) {
          console.error(error)
        }
      }, 500)
    }
  }

  async newPage() {
    const chrome = this.chrome
    if (!chrome) throw new Error('chrome is not defined')
    return await chrome.newPage()
  }
}

export function cutArray<T>(array: T[], subLength: number): T[][] {
  let index = 0
  let newArr = []
  while (index < array.length) {
    newArr.push(array.slice(index, (index += subLength)))
  }
  return newArr
}

export function restoreEnter(text: string) {
  return text.replace(SPLIT_ENTER_REG, '\n')
}
