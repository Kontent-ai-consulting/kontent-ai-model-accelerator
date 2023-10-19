import { ContentTypeModels, ManagementClient } from '@kontent-ai/management-sdk';
import { IJsonContentType, logDebug } from '../../core';
import { ITargetEnvironmentData } from '../import.models';

export class ImportContentTypesHelper {
    async importContentTypesAsync(data: {
        managementClient: ManagementClient;
        importContentTypes: IJsonContentType[];
        existingData: ITargetEnvironmentData;
    }): Promise<ContentTypeModels.ContentType[]> {
        const contentTypes: ContentTypeModels.ContentType[] = [];

        for (const importContentType of data.importContentTypes) {
            if (data.existingData.contentTypes.find((m) => m.externalId === importContentType.externalId)) {
                // skip content type
                logDebug({
                    type: 'Skip',
                    message: 'Skipping content type because it already exists',
                    partA: importContentType.name
                });
            } else {
                logDebug({
                    type: 'Import',
                    message: 'Importing content type',
                    partA: importContentType.name
                });
                contentTypes.push(
                    (
                        await data.managementClient
                            .addContentType()
                            .withData((builder) => {
                                return {
                                    elements: importContentType.elements,
                                    name: importContentType.name,
                                    codename: importContentType.codename,
                                    content_groups: importContentType.contentGroups,
                                    external_id: importContentType.externalId
                                };
                            })
                            .toPromise()
                    ).data
                );
            }
        }

        return contentTypes;
    }
}

export const importContentTypesHelper = new ImportContentTypesHelper();
