import { createDeliveryClient, IDeliveryClient } from '@kontent-ai/delivery-sdk';

const acceleratorEnvironmentId: string = '77004149-9b3a-01e8-f362-d776466d4545';

export function getAcceleratorDeliveryClient(): IDeliveryClient {
    return createDeliveryClient({
        environmentId: acceleratorEnvironmentId
    });
}
