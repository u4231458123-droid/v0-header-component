/**
 * CSS Module Type Declarations
 * Ermöglicht den Import von CSS-Dateien ohne TypeScript-Fehler
 */

declare module "*.css" {
  const content: { [className: string]: string }
  export default content
}

declare module "*.scss" {
  const content: { [className: string]: string }
  export default content
}

declare module "*.sass" {
  const content: { [className: string]: string }
  export default content
}
