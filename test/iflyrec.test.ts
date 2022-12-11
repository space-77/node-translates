import { iflyrecTranslator, Languages } from '../src/index'

test('测试讯飞翻译', async () => {
  const text = await iflyrecTranslator({ text: '你好', from: Languages.ZH, to: Languages.EN })
  expect(text.dst).toBe('Hello')
})

// test('测试 讯飞 多个多句翻译', async () => {
//   const text = (await iflyrecTranslator(['你', '好', '沙漏', '湿巾', '绿萝', '口罩', '下班'])) ?? []
//   expect(text.map(i => i.en).join(',')).toBe(['You', 'OK', 'Hourglass', 'Wet wipes', 'Green dill', 'Gauze mask', 'Knock off'].join(','))
// })
