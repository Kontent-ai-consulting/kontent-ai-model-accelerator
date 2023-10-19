import { IDeliveryClient } from '@kontent-ai/delivery-sdk';
import { getAcceleratorDeliveryClient, httpService } from './deliveryClient';
import { AcceleratorModel, contentTypes } from '../models/kontent-ai';
import { is404Error } from '../core';
import { IExportJson } from 'lib/export';

export function getAcceleratorDataService(): AcceleratorDataService {
    return new AcceleratorDataService();
}

export class AcceleratorDataService {
    private readonly deliveryClient: IDeliveryClient = getAcceleratorDeliveryClient();

    async getAcceleratorProjectsAsync(): Promise<AcceleratorModel[]> {
        return (
            await this.deliveryClient
                .items<AcceleratorModel>()
                .type(contentTypes.accelerator_model.codename)
                .depthParameter(0)
                .toAllPromise()
        ).data.items;
    }

    async getAcceleratorProjectByCodenameAsync(codename: string): Promise<AcceleratorModel> {
        try {
            const item = (await this.deliveryClient.item<AcceleratorModel>(codename).depthParameter(0).toPromise()).data
                .item;

            return item;
        } catch (error) {
            if (is404Error(error)) {
                throw Error(`Could not find accelerator project with codename '${codename}'`);
            }

            throw error;
        }
    }

    async extractJsonFromProjectAsync(acceleratorModel: AcceleratorModel): Promise<IExportJson> {
        const assetBinaryData = await this.getBinaryDataFromUrlAsync(
            acceleratorModel.elements.export_data.value[0].url
        );

        return JSON.parse(assetBinaryData);
    }

    private async getBinaryDataFromUrlAsync(url: string): Promise<any> {
        // temp fix for Kontent.ai Repository not validating url
        url = url.replace('#', '%23');

        const response = await httpService.getAsync(
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
