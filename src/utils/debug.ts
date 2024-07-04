import chalk from 'chalk'

import fs from 'fs'

import env from '../configs/env'

// @ts-ignore
const debugModule: (...arg: any[]) => DebugFunction = require('debug')

type Chalk = typeof chalk
const generateBadge = (
  bgColor: Chalk['BackgroundColor'],
  btColor: Chalk['ForegroundColor'],
  badgeText: string
) => chalk[bgColor](chalk[btColor](` ${badgeText} `))

if (env.debugOutputPath) {
  const logStream = fs.createWriteStream(env.debugOutputPath)
  // @ts-ignore
  process.stderr.write = process.stdout.write = logStream.write.bind(logStream)
}

export type DebugOptions = {
  message?: string
  type?: string
  color?: Chalk['Color'] | Chalk['Modifiers']
  badge?: {
    bgColor: Chalk['BackgroundColor']
    fgColor: Chalk['ForegroundColor']
  }
  cb?: (...args: any) => void
}
interface DebugFunction {
  (...arg: any[]): void
  namespace?: string
}
export const createDebug = (
  debug: string | DebugFunction,
  options: DebugOptions = {}
): DebugFunction => {
  const { message = '', color = 'reset', badge, cb } = options

  const mBadge = badge
    ? generateBadge(badge.bgColor, badge.fgColor, message) + ' '
    : chalk[color](message)

  const debugFunction: DebugFunction =
    typeof debug === 'string'
      ? debugModule(`${env.debugPrefix}${debug}`)
      : debug

  return (...arg) => {
    const type =
      options.type || '%O '.repeat(Math.max(arg.length, 1)).trimRight()

    debugFunction(`${mBadge}${chalk[color](type)}`, ...arg)
    if (cb) cb(debugFunction.namespace, '|', ...arg)
  }
}
