export function withLineNumbers(content: string): string[] {
  return content.split(/\r?\n/)
}
