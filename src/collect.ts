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

export type StartTranslate = (dataList: [string, WaitList[]][]) => void

class Collect {
  time = 200
  timer?: NodeJS.Timeout
  waitList: WaitList[] = []

  constructor(public startTranslate: StartTranslate) {
    this.start()
  }

  removeWaitList(waitList: WaitList[]) {
    this.waitList = _.remove(this.waitList, item => waitList.includes(item))
  }

  start() {
    this.timer = setTimeout(() => {
      cutArray(this.waitList, 100).forEach(textInfoList => {
        const group = _.groupBy(textInfoList, 'fromTo')
        this.startTranslate(Object.entries(group))
        this.removeWaitList(textInfoList)
      })
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

  createCollect(key: TranslateNames, translate: StartTranslate) {
    if (!this.collectList.some(i => i.key === key)) {
      this.collectList.push({ key, collect: new Collect(translate) })
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
