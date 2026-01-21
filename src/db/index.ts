export * from './folder'
export * from './feed'
export * from './article'

export function timestamp(): string {
  return new Date().toISOString()
}
