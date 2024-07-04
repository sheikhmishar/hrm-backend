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
