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
          const valueAsDate = new Date('2000-01-01T' + value)
          const relatedValueAsDate = new Date('2000-01-01T' + relatedValue)
          return (
            !!valueAsDate.getTime() &&
            !!relatedValueAsDate.getTime() &&
            valueAsDate > relatedValueAsDate
          )
        }
      }
    })
  }
}
