import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { chromium, type Browser } from 'playwright';
import { PdfGenerator } from '@infra/pdf/pdf-generator';

@Injectable()
export class PlaywrightPdfGenerator extends PdfGenerator implements OnModuleInit, OnModuleDestroy {
  private browser: Browser | null = null;

  async onModuleInit(): Promise<void> {
    this.browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox'],
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.browser?.close();
    this.browser = null;
  }

  async generate(html: string): Promise<Buffer> {
    if (!this.browser) {
      throw new Error('PDF browser is not initialized');
    }

    const page = await this.browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'load' });
      return await page.pdf({ format: 'A4', printBackground: true });
    } finally {
      await page.close();
    }
  }
}
