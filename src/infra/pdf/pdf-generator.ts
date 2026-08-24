export abstract class PdfGenerator {
  abstract generate(html: string): Promise<Buffer>;
}
