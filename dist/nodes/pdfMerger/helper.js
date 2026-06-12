"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergePdfs = mergePdfs;
exports.embedPageIfExists = embedPageIfExists;
const pdf_lib_1 = require("pdf-lib");
async function mergePdfs(pdfFile1, pdfFile2, fileName) {
    const pdfDoc1 = await pdf_lib_1.PDFDocument.load(pdfFile1);
    const pdfDoc2 = await pdf_lib_1.PDFDocument.load(pdfFile2);
    const mergedPdf = await pdf_lib_1.PDFDocument.create();
    const doc1Pages = pdfDoc1.getPages();
    const doc2Pages = pdfDoc2.getPages();
    const houseStylePage = doc1Pages.length > 0 ? doc1Pages[0] : undefined;
    const embeddedHouseStylePage = houseStylePage
        ? (await mergedPdf.embedPages([houseStylePage]))[0]
        : null;
    for (let pageIndex = 0; pageIndex < doc2Pages.length; pageIndex++) {
        const contentSource = doc2Pages[pageIndex];
        const embeddedContentPage = await embedPageIfExists(mergedPdf, contentSource);
        const [width, height] = await determinePageSize(embeddedHouseStylePage, embeddedContentPage);
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
async function embedPageIfExists(pdfDoc, sourcePage) {
    if (!sourcePage) {
        return null;
    }
    const [embedded] = await pdfDoc.embedPages([sourcePage]);
    return embedded;
}
async function determinePageSize(hStylePage, contentPage) {
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
//# sourceMappingURL=helper.js.map