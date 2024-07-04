
export const foreignKeyError = 'ER_NO_REFERENCED_ROW_2'
export const duplicateEntryError = 'ER_DUP_ENTRY'
export const SQL_REF_ENTITY_REGEX = /REFERENCES `(?<table>.*?)`/g // TODO: named capture group in constant
export const SQL_DUP_ENTITY_REGEX = /for key '(?<column_idx>.*?)'/g
