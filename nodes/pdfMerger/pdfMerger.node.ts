import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { mergePdfs } from './helper';

export class PDFMerger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PDF Merger',
		name: 'PDFMerger',
		icon: { light: 'file:PDFMerger.svg', dark: 'file:PDFMerger.dark.svg' },
		group: ['input'],
		version: [1],
		description: 'Basic Example Node',
		defaults: {
			name: 'Example',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];


		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const binaryData1BinaryName = this.getNodeParameter('binaryData1', itemIndex) as string;
				const binaryData2BinaryName = this.getNodeParameter('binaryData2', itemIndex) as string;
				let binaryData1: Buffer
				let binaryData2: Buffer

				try {
					binaryData1 = await this.helpers.getBinaryDataBuffer(itemIndex, binaryData1BinaryName);
					binaryData2 = await this.helpers.getBinaryDataBuffer(itemIndex, binaryData2BinaryName);
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Binary property "${binaryData1BinaryName}" or "${binaryData2BinaryName}" does not exist on item ${itemIndex}`);
				}


				const outputFileName = this.getNodeParameter('outputFileName', itemIndex) as string;
				const outputBinaryProperty = this.getNodeParameter('outputBinaryProperty', itemIndex) as string;

				this.logger.info(`Binary1: ${binaryData1.length} bytes, Binary2: ${binaryData2.length} bytes`);

				const mergedPdfBuffer = await mergePdfs(binaryData1, binaryData2, outputFileName);

				this.logger.info(`Merged PDF size: ${mergedPdfBuffer.length} bytes`);

				returnData.push({json: { success: true }, binary: { [outputBinaryProperty]: await this.helpers.prepareBinaryData(Buffer.from(mergedPdfBuffer), outputFileName) }});
				
			} catch (error) {
				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					returnData.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [returnData];
	}
}
