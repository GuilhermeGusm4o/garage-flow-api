import { Module } from '@nestjs/common';
import { PdfGenerator } from '@infra/pdf/pdf-generator';
import { PlaywrightPdfGenerator } from '@infra/pdf/playwright-pdf-generator.service';

@Module({
  providers: [{ provide: PdfGenerator, useClass: PlaywrightPdfGenerator }],
  exports: [PdfGenerator],
})
export class PdfModule {}
