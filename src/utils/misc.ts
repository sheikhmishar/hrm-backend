// TODO: check
export const singularify = (value: string) =>
  value.endsWith('ies')
    ? value.substring(0, value.lastIndexOf('ies')) + 'y'
    : value.endsWith('sses')
    ? value.substring(0, value.lastIndexOf('sses'))
    : value.endsWith('s')
    ? value.substring(0, value.lastIndexOf('s'))
    : value

export const capitalize = (value: string) =>
  `${(value[0] || '').toUpperCase()}${value.substring(1)}`

export const capitalizeDelim = (value: string, delim = '_', replace = '_id_') =>
  value
    .split(delim)
    .map(v => v.replace(replace, ''))
    .map(capitalize)
    .join(' ')

export const pascalToSnakeCase = (pascalCaseString: string) =>
  pascalCaseString.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()

export const timeToDate = (time: string) => new Date('2021-01-01T' + time)
export const stringToDate = (str: string) => new Date(str.replace(/-/g, '/'))

export const dateToString = (date: Date) =>
  `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`

import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator
} from 'class-validator'

export function IsAfterTime<T extends { [k: string]: any }>(
  property: keyof T,
  validationOptions?: ValidationOptions
) {
  return function (object: T, propertyName: string) {
    registerDecorator({
      name: 'isAfterTime',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints
          const relatedValue = (args.object as any)[relatedPropertyName]
          return (value?.localeCompare?.(relatedValue) || 0) > 0
        }
      }
    })
  }
}
export function IsAtOrAfterDate<T extends { [k: string]: any }>(
  property: keyof T,
  validationOptions?: ValidationOptions
) {
  return function (object: T, propertyName: string) {
    registerDecorator({
      name: 'isAtOrAfterDate',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints
          const relatedValue = (args.object as any)[relatedPropertyName]
          return stringToDate(value) >= stringToDate(relatedValue)
        }
      }
    })
  }
}
const ensureKVSame = <T extends string>(v: { [k in T]?: k }) => v

export const SETTING_KEYS = {
  ATTENDANCE_ENTRY_GRACE_PERIOD: 'ATTENDANCE_ENTRY_GRACE_PERIOD',
  ATTENDANCE_LEAVE_GRACE_PERIOD: 'ATTENDANCE_LEAVE_GRACE_PERIOD',
  PAYROLL_CYCLE_START_DATE: 'PAYROLL_CYCLE_START_DATE'
} as const

ensureKVSame(SETTING_KEYS)

export const SETTINGS = {
  PAYROLL_CYCLE_START_DATE: 1,
  ATTENDANCE_ENTRY_GRACE_PERIOD: '10m',
  ATTENDANCE_LEAVE_GRACE_PERIOD: '10m'
} satisfies { [k in keyof typeof SETTING_KEYS]: string | number }

export const BEGIN_DATE = '1900-01-01',
  END_DATE = '2299-01-01'

export const getPreviousMonth = (date: Date) => {
  const newDate = new Date(date)
  newDate.setMonth((newDate.getMonth() + 12 - 1) % 12)
  newDate.setFullYear(
    newDate.getMonth() === 11
      ? newDate.getFullYear() - 1
      : newDate.getFullYear()
  )
  return newDate
}

export const getNextMonth = (date: Date) => {
  const newDate = new Date(date)
  newDate.setMonth((newDate.getMonth() + 1) % 12)
  newDate.setFullYear(
    newDate.getMonth() === 0 ? newDate.getFullYear() + 1 : newDate.getFullYear()
  )
  return newDate
}

export const getDateRange = (date: Date) => {
  let [from, to] = [new Date(date), new Date(date)]
  if (from.getDate() < SETTINGS.PAYROLL_CYCLE_START_DATE)
    from = getPreviousMonth(from)
  else to = getNextMonth(to)
  from.setDate(SETTINGS.PAYROLL_CYCLE_START_DATE)
  to.setDate(SETTINGS.PAYROLL_CYCLE_START_DATE - 1)
  return [from, to] as const
}

export const getYearRange = (date: Date) => {
  const year = date.getFullYear()
  return [
    `${year}-01-${SETTINGS.PAYROLL_CYCLE_START_DATE}`,
    new Date(year + 1, 0, SETTINGS.PAYROLL_CYCLE_START_DATE - 1)
      .toISOString()
      .split('T')[0]!
  ] as const
}

export const dayDifference = (date1: Date, date2: Date, absolute = true) => {
  let timestampDiff = date1.getTime() - date2.getTime()
  if (absolute) timestampDiff = Math.abs(timestampDiff)
  // dayjs(date1).diff(date2, 'dates')
  return (
    Math.floor(timestampDiff / (3600000 * 24)) + (timestampDiff < 0 ? -1 : 1)
  )
}

const nameOfDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export function generateCalender(from: Date, to: Date) {
  const firstDay = from.getDay()

  const date = new Date(from)
  date.setDate(date.getDate() - 1)

  return new Array(dayDifference(from, to))
    .fill(null)
    .map(() => {
      date.setTime(date.getTime() + 24 * 3600000)
      return dateToString(date).substring(5)
    })
    .map((date, i) => ({
      dayName: nameOfDays[(firstDay + i) % 7] as (typeof nameOfDays)[number],
      date: date.substring(3),
      month: date.substring(0, 2)
    }))
}
