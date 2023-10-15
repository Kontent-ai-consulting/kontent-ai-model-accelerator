import { ContentTypeModels, ManagementClient } from '@kontent-ai/management-sdk';
import { IJsonContentType } from 'lib/core';

export class ImportContentTypesHelper {
    async importContentTypesAsync(
        managementClient: ManagementClient,
        importContentTypes: IJsonContentType[]
    ): Promise<ContentTypeModels.ContentType[]> {
        const contentTypes: ContentTypeModels.ContentType[] = [];

        return contentTypes;
    }
}

export const importContentTypesHelper = new ImportContentTypesHelper();
