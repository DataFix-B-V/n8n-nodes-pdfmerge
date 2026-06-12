import {
	PDFDocument,
	PDFPage,
	PDFEmbeddedPage,
} from 'pdf-lib';

export async function mergePdfs(pdfFile1: Buffer, pdfFile2: Buffer, fileName: string): Promise<Uint8Array> {
		const pdfDoc1 = await PDFDocument.load(pdfFile1);
		const pdfDoc2 = await PDFDocument.load(pdfFile2);
		const mergedPdf = await PDFDocument.create();

		const doc1Pages = pdfDoc1.getPages();
		const doc2Pages = pdfDoc2.getPages();

		const houseStylePage = doc1Pages.length > 0 ? doc1Pages[0] : undefined;
		const embeddedHouseStylePage = houseStylePage 
			? (await mergedPdf.embedPages([houseStylePage]))[0]
			: null;

		for (let pageIndex = 0; pageIndex < doc2Pages.length; pageIndex++) {
			const contentSource = doc2Pages[pageIndex];
			const embeddedContentPage = await embedPageIfExists(mergedPdf, contentSource);

			const [width, height] = await determinePageSize(
				embeddedHouseStylePage,
				embeddedContentPage,
			);

			const mergedPage = mergedPdf.addPage([width, height]);

			if (embeddedHouseStylePage) {
				mergedPage.drawPage(embeddedHouseStylePage, { x: 0, y: 0 });
			}

			if (embeddedContentPage) {
				mergedPage.drawPage(embeddedContentPage, { x: 0, y: 0 });
			}
		}

  return mergedPdf.save();
}

export async function embedPageIfExists(pdfDoc: PDFDocument, sourcePage?: PDFPage): Promise<PDFEmbeddedPage | null> {
  if (!sourcePage) {
    return null;
  }

  const [embedded] = await pdfDoc.embedPages([sourcePage]);
  return embedded;
}

async function determinePageSize(hStylePage?: PDFEmbeddedPage | null, contentPage?: PDFEmbeddedPage | null): Promise<[number, number]> {
  // Default ~ A4
  const defaultWidth = 595;
  const defaultHeight = 842;

  if (hStylePage) {
    return [hStylePage.width, hStylePage.height];
  }
  if (contentPage) {
    return [contentPage.width, contentPage.height];
  }
  return [defaultWidth, defaultHeight];
}

