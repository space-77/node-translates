import _ from 'lodash'
import { Languages, SPLIT_ENTER, TranslateNames } from './config'
import { cutArray } from './utils'

export type TextInfo = { text: string; from: Languages; to: Languages }

export type WaitResolve = { text: string; dst: string }
export type WaitList = {
  text: string
  fromTo: string
  to: Languages
  from: Languages
  resolve: (res: WaitResolve) => void
  reject: (err?: any) => void
}

export type StartTranslate = (dataList: [string, WaitList[]][]) => Promise<any>

class Collect {
  time = 200
  timer?: NodeJS.Timeout
  waitList: WaitList[] = []

  constructor(public startTranslate: StartTranslate, public pageNumber = 100) {
    this.start()
  }

  protected removeWaitList(waitList: WaitList[]) {
    this.waitList = _.remove(this.waitList, item => waitList.includes(item))
  }

  protected start() {
    this.timer = setTimeout(async () => {
      const { waitList, pageNumber } = this
      this.waitList = []
      const cutWaitList = cutArray(waitList, pageNumber)
      // for await (const iterator of cutWaitList) {
      //   const group = _.groupBy(iterator, 'fromTo')
      //   await this.startTranslate(Object.entries(group))
      // }

      if (cutWaitList.length > 10) {
        const doubleCutWaitList = cutArray(cutWaitList, 10)
        let index = 0
        for await (const pages of doubleCutWaitList) {
          index++
          console.log(`第 ${index} 批翻译`)
          await Promise.all(
            pages.map(async textInfoList => {
              const group = _.groupBy(textInfoList, 'fromTo')
              await this.startTranslate(Object.entries(group))
            })
          )
        }
      } else {
        cutWaitList.forEach(textInfoList => {
          const group = _.groupBy(textInfoList, 'fromTo')
          this.startTranslate(Object.entries(group))
        })
      }
    }, this.time)
  }

  protected reStart() {
    // 1、清楚定时器
    // 2、重新几时
    clearTimeout(this.timer)
    this.start()
  }

  add({ text, from, to }: TextInfo) {
    this.reStart()
    text = text.trim() //.replace(/\r?\n/g, SPLIT_ENTER) // 去除换行符
    return new Promise<WaitResolve>((resolve, reject) => {
      this.waitList.push({ text, fromTo: `${from}_${to}`, from, to, resolve, reject })
    })
  }
}

export default class Collector {
  protected collectList: { key: TranslateNames; collect: Collect }[] = []

  createCollect(key: TranslateNames, translate: StartTranslate, pageNumber?: number) {
    if (!this.collectList.some(i => i.key === key)) {
      this.collectList.push({ key, collect: new Collect(translate, pageNumber) })
    }
  }

  getCollect(key: TranslateNames) {
    return this.collectList.find(i => i.key === key)?.collect
  }

  addTranslate(info: TextInfo, key: TranslateNames) {
    const collect = this.getCollect(key)
    if (!collect) throw new Error(`${key} collect is not defined`)
    return collect.add(info)
  }
}
