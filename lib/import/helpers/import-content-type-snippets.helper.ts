import { ContentTypeSnippetModels, ManagementClient } from '@kontent-ai/management-sdk';
import { IJsonContentTypeSnippet, logAction } from '../../core';
import { ITargetEnvironmentData } from '../import.models';

export class ImportContentTypeSnippetsHelper {
    async importContentTypeSnipppetsAsync(data: {
        managementClient: ManagementClient;
        importContentTypeSnippets: IJsonContentTypeSnippet[];
        existingData: ITargetEnvironmentData;
    }): Promise<ContentTypeSnippetModels.ContentTypeSnippet[]> {
        const contentTypeSnippets: ContentTypeSnippetModels.ContentTypeSnippet[] = [];

        for (const importContentTypeSnippet of data.importContentTypeSnippets) {
            if (data.existingData.contentTypeSnippets.find((m) => m.externalId === importContentTypeSnippet.externalId)) {
                logAction(
                    'skip',
                    'Skipping content type snippet because it already exists',
                    importContentTypeSnippet.name
                );
            } else {
                logAction('import', 'Import content type snippet', importContentTypeSnippet.name);
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
