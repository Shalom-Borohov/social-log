const COMMA_OR_JOINING_VAV = /,|\s+ו\s*/

export function splitParts(text: string): string[] {
  return text
    .split(COMMA_OR_JOINING_VAV)
    .map((part) => part.trim())
    .filter(Boolean)
}
