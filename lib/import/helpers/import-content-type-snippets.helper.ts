import { ContentTypeSnippetModels, ManagementClient } from '@kontent-ai/management-sdk';
import { IJsonContentTypeSnippet, logDebug } from '../../core';
import { ITargetEnvironmentData } from '../import.models';

export class ImportContentTypeSnippetsHelper {
    async importContentTypeSnipppetsAsync(data: {
        managementClient: ManagementClient;
        importContentTypeSnippets: IJsonContentTypeSnippet[];
        existingData: ITargetEnvironmentData;
    }): Promise<ContentTypeSnippetModels.ContentTypeSnippet[]> {
        const contentTypeSnippets: ContentTypeSnippetModels.ContentTypeSnippet[] = [];

        for (const importContentTypeSnippet of data.importContentTypeSnippets) {
            if (
                data.existingData.contentTypeSnippets.find((m) => m.externalId === importContentTypeSnippet.externalId)
            ) {
                logDebug({
                    type: 'Skip',
                    message: `Content type snippet with external id '${importContentTypeSnippet.externalId}' already exists`,
                    partA: importContentTypeSnippet.name
                });
            } else if (
                data.existingData.contentTypeSnippets.find((m) => m.codename === importContentTypeSnippet.codename)
            ) {
                logDebug({
                    type: 'Skip',
                    message: `Content type snippet with codename '${importContentTypeSnippet.codename}' already exists`,
                    partA: importContentTypeSnippet.name
                });
            } else {
                logDebug({
                    type: 'Import',
                    message: 'Importing content type snippet',
                    partA: importContentTypeSnippet.name
                });
                contentTypeSnippets.push(
                    (
                        await data.managementClient
                            .addContentTypeSnippet()
                            .withData((builder) => {
                                return {
                                    elements: importContentTypeSnippet.elements,
                                    name: importContentTypeSnippet.name,
                                    codename: importContentTypeSnippet.codename,
                                    external_id: importContentTypeSnippet.externalId
                                };
                            })
                            .toPromise()
                    ).data
                );
            }
        }

        return contentTypeSnippets;
    }
}

export const importContentTypeSnippetsHelper = new ImportContentTypeSnippetsHelper();
