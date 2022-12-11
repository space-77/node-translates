import puppeteer, { Browser, Page } from 'puppeteer-core'
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
  page!: Page
  useCount = 0
  static instance: IBrowser
  chrome!: Browser | null

  constructor() {
    if (!IBrowser.instance) IBrowser.instance = this
    this.useCount++
    if (this.chrome) this.init()
    return IBrowser.instance
  }
  async init() {
    if (!this.chrome) {
      const chromePath = getChromePath()
      // this.chrome = await puppeteer.launch({ executablePath: chromePath, headless: false })
      this.chrome = await puppeteer.launch({ executablePath: chromePath })
    }
  }

  async close() {
    this.useCount--
    if (this.useCount <= 0) {
      try {
        await this.chrome?.close()
        this.chrome = null
      } catch (error) {
        console.error(error)
      }
    }
  }

  async newPage() {
    const chrome = this.chrome
    return await chrome?.newPage()
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
