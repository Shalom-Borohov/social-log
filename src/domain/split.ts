const COMMA = ','
const JOINING_VAV = /\s+ו\s*/
const LONE_VAV_AT_START = /^ו(\s+|$)/

export function splitParts(text: string): string[] {
  return text
    .split(COMMA)
    .flatMap((part) => part.trim().replace(LONE_VAV_AT_START, '').split(JOINING_VAV))
    .map((part) => part.trim())
    .filter(Boolean)
}
