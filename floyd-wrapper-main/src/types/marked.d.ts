declare module 'marked' {
  export interface MarkedExtension {
    renderer?: any;
  }

  export class Renderer {
    heading(text: string, level: number): string;
    paragraph(text: string): string;
    code(code: string, language: string): string;
    blockquote(quote: string): string;
    list(text: string, ordered: boolean): string;
    listitem(text: string): string;
    strong(text: string): string;
    em(text: string): string;
    codespan(code: string): string;
    br(): string;
    link(href: string, title: string | null, text: string): string;
    table(header: string, body: string): string;
    tablerow(content: string): string;
    tablecell(content: string, flags: { header: boolean; align: 'center' | 'left' | 'right' | null }): string;
  }

  export function use(extension: MarkedExtension): void;
  export function parse(src: string, options?: { async: boolean }): string | Promise<string>;
}
