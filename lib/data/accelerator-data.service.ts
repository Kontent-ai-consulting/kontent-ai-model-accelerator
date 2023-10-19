import { IDeliveryClient } from '@kontent-ai/delivery-sdk';
import { getAcceleratorDeliveryClient } from './deliveryClient';
import { AcceleratorModel, contentTypes } from '../models/kontent-ai';

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
}
