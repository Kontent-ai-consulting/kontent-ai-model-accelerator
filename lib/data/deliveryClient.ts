import { createDeliveryClient, IDeliveryClient } from '@kontent-ai/delivery-sdk';
import { HttpService } from '@kontent-ai/core-sdk';

const acceleratorEnvironmentId: string = '77004149-9b3a-01e8-f362-d776466d4545';

export const httpService: HttpService = new HttpService({ logErrorsToConsole: false });

export function getAcceleratorDeliveryClient(): IDeliveryClient {
    return createDeliveryClient({
        environmentId: acceleratorEnvironmentId,
        httpService: httpService
    });
}
