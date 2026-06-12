"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFMerger = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const helper_1 = require("./helper");
class PDFMerger {
    constructor() {
        this.description = {
            displayName: 'PDF Merger',
            name: 'PDFMerger',
            icon: { light: 'file:PDFMerger.svg', dark: 'file:PDFMerger.dark.svg' },
            group: ['input'],
            version: [1],
            description: 'Basic Example Node',
            defaults: {
                name: 'Example',
            },
            inputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            outputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            usableAsTool: true,
            properties: [
                {
                    displayName: 'PDF File with House Style',
                    name: 'binaryData1',
                    type: 'string',
                    required: true,
                    default: 'binaryData1',
                    description: 'Name of the binary property that contains the PDF with the house style',
                },
                {
                    displayName: 'PDF File with Content',
                    name: 'binaryData2',
                    type: 'string',
                    required: true,
                    default: 'binaryData2',
                    description: 'Name of the binary property that contains the PDF with the content',
                },
                {
                    displayName: 'Output File Name',
                    name: 'outputFileName',
                    type: 'string',
                    required: true,
                    default: 'merged.pdf',
                    description: 'Name of the output file',
                },
                {
                    displayName: 'Output Binary Property',
                    name: 'outputBinaryProperty',
                    type: 'string',
                    required: true,
                    default: 'mergedPdf',
                    description: 'Name of the binary property in which to store the merged PDF',
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            try {
                const binaryData1BinaryName = this.getNodeParameter('binaryData1', itemIndex);
                const binaryData2BinaryName = this.getNodeParameter('binaryData2', itemIndex);
                let binaryData1;
                let binaryData2;
                try {
                    binaryData1 = await this.helpers.getBinaryDataBuffer(itemIndex, binaryData1BinaryName);
                    binaryData2 = await this.helpers.getBinaryDataBuffer(itemIndex, binaryData2BinaryName);
                }
                catch (error) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Binary property "${binaryData1BinaryName}" or "${binaryData2BinaryName}" does not exist on item ${itemIndex}`);
                }
                const outputFileName = this.getNodeParameter('outputFileName', itemIndex);
                const outputBinaryProperty = this.getNodeParameter('outputBinaryProperty', itemIndex);
                this.logger.info(`Binary1: ${binaryData1.length} bytes, Binary2: ${binaryData2.length} bytes`);
                const mergedPdfBuffer = await (0, helper_1.mergePdfs)(binaryData1, binaryData2, outputFileName);
                this.logger.info(`Merged PDF size: ${mergedPdfBuffer.length} bytes`);
                returnData.push({ json: { success: true }, binary: { [outputBinaryProperty]: await this.helpers.prepareBinaryData(Buffer.from(mergedPdfBuffer), outputFileName) } });
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
                }
                else {
                    if (error.context) {
                        error.context.itemIndex = itemIndex;
                        throw error;
                    }
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), error, {
                        itemIndex,
                    });
                }
            }
        }
        return [returnData];
    }
}
exports.PDFMerger = PDFMerger;
//# sourceMappingURL=pdfMerger.node.js.map