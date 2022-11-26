import got from 'got-cjs'
import { CookieJar } from 'tough-cookie'

export const cookieJar = new CookieJar()
export default got.extend({ cookieJar })
