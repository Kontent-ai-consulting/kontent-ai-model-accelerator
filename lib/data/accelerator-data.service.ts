import { defaultHttpService, getAllAcceleratorsUrl, logDebug } from '../core/index.js';
import { HttpService } from '@kontent-ai/core-sdk';
import { IExportJson } from '../export/index.js';
import { IAccelerator, IAcceleratorResponse } from './accelerator-models.js';

export function getAcceleratorDataService(): AcceleratorDataService {
    return new AcceleratorDataService();
}

export class AcceleratorDataService {
    private readonly httpService: HttpService = defaultHttpService;

    async getAllAcceleratorsAsync(): Promise<IAccelerator[]> {
        const response = await this.httpService.getAsync<IAcceleratorResponse>({
            url: getAllAcceleratorsUrl
        });

        return response.data.data.accelerators;
    }

    async getAcceleratorModelByCodenameAsync(codename: string): Promise<IAccelerator> {
        const item = (await this.getAllAcceleratorsAsync()).find(
            (m) => m.codename.toLowerCase() === codename.toLowerCase()
        );

        if (!item) {
            throw Error(`Could not find accelerator project with codename '${codename}'`);
        }

        return item;
    }

    async extractJsonFromModelAsync(accelerator: IAccelerator): Promise<IExportJson> {
        const assetBinaryData = await this.getBinaryDataFromUrlAsync(accelerator.exportUrl);

        return JSON.parse(assetBinaryData);
    }

    private async getBinaryDataFromUrlAsync(url: string): Promise<any> {
        // temp fix for Kontent.ai Repository not validating url
        url = url.replace('#', '%23');

        logDebug({
            type: 'Fetch',
            message: `Downloading Binary data`,
            partA: url
        });

        const response = await this.httpService.getAsync(
            {
                url
            },
            {
                responseType: 'arraybuffer'
            }
        );

        return response.data;
    }
}
