import { PDFDocument, PDFPage, PDFEmbeddedPage } from 'pdf-lib';
export declare function mergePdfs(pdfFile1: Buffer, pdfFile2: Buffer, fileName: string): Promise<Uint8Array>;
export declare function embedPageIfExists(pdfDoc: PDFDocument, sourcePage?: PDFPage): Promise<PDFEmbeddedPage | null>;
