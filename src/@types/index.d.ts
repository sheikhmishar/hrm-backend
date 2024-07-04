declare global {
  namespace NodeJS {
    interface ProcessEnv extends Dict<string> {
      NODE_ENV?: string
      DEBUG?: string
      DEBUG_OUT_PATH?: string
      DEBUG_HIDE_DATE?: string
      DEBUG_COLORS?: string
      DEBUG_PREFIX?: string
      DEBUG_DEPTH?: string
      DEBUG_SHOW_HIDDEN?: string
      FORCE_COLOR?: string
      NODE_ENV?: string
      PORT?: string
      IP?: string
      ORIGIN?: string
      DB_NAME?: string
      DB_USER?: string
      DB_PASS?: string
      DB_PORT?: string
      DB_DEBUG?: string
      JWT_KEY?: string
      JWT_ISSUER?: string
    }
  }
  interface Error {
    status?: number
    code?: string
    [key: string]: any
  }
  type OmitKey<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
  type RequiredFields<T> = {
    [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K]
  }
  type Modify<T, R extends Partial<T>> = Omit<T, keyof R> & R

  declare function parseInt(string?: string, radix?: number): number

  interface Array<T> {
    includes(searchElement?: T, fromIndex?: number): boolean
  }
  interface ReadonlyArray<T> {
    includes(searchElement?: T, fromIndex?: number): boolean
  }
  interface Int8Array {
    includes(searchElement?: number, fromIndex?: number): boolean
  }
  interface Uint8Array {
    includes(searchElement?: number, fromIndex?: number): boolean
  }
  interface Uint8ClampedArray {
    includes(searchElement?: number, fromIndex?: number): boolean
  }
  interface Int16Array {
    includes(searchElement?: number, fromIndex?: number): boolean
  }
  interface Uint16Array {
    includes(searchElement?: number, fromIndex?: number): boolean
  }
  interface Int32Array {
    includes(searchElement?: number, fromIndex?: number): boolean
  }
  interface Uint32Array {
    includes(searchElement?: number, fromIndex?: number): boolean
  }
  interface Float32Array {
    includes(searchElement?: number, fromIndex?: number): boolean
  }
  interface Float64Array {
    includes(searchElement?: number, fromIndex?: number): boolean
  }
}
export {}
