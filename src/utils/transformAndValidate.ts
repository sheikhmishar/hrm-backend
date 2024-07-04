import {
  plainToInstance,
  type ClassConstructor,
  type ClassTransformOptions
} from 'class-transformer'
import { validateOrReject, type ValidatorOptions } from 'class-validator'

import env from '../configs/env'

function plainToInstanceMod<T, V>(
  cls: ClassConstructor<T>,
  plain: V[],
  options?: ClassTransformOptions
): T[]
function plainToInstanceMod<T, V>(
  cls: ClassConstructor<T>,
  plain: V,
  options?: ClassTransformOptions
): T
function plainToInstanceMod<T, V>(
  cls: ClassConstructor<T>,
  plain: V | V[],
  options: ClassTransformOptions = {}
) {
  return plainToInstance(cls, plain, {
    enableImplicitConversion: true,
    ...options
  })
}

const validateMod = (object: object, validatorOptions: ValidatorOptions = {}) =>
  validateOrReject(object, {
    stopAtFirstError: env.production,
    forbidUnknownValues: true,
    whitelist: true,
    // forbidNonWhitelisted: true,
    ...validatorOptions
  })

export default async function transformAndValidate<T, V>(
  cls: ClassConstructor<T>,
  plain: V[]
): Promise<T[]>
export default async function transformAndValidate<T, V>(
  cls: ClassConstructor<T>,
  plain: V
): Promise<T>
export default async function transformAndValidate<T, V>(
  cls: ClassConstructor<T>,
  plain: V | V[]
) {
  const transformed = plainToInstanceMod(cls, plain)
  await validateMod(transformed as object)

  return transformed
}
