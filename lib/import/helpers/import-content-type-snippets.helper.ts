import { ContentTypeSnippetModels, ManagementClient } from '@kontent-ai/management-sdk';
import { IJsonContentTypeSnippet, logDebug } from '../../core';
import { ITargetEnvironmentData } from '../import.models';
import { guidHelper } from '../../helpers';

export class ImportContentTypeSnippetsHelper {
    async importContentTypeSnipppetsAsync(data: {
        managementClient: ManagementClient;
        importContentTypeSnippets: IJsonContentTypeSnippet[];
        existingData: ITargetEnvironmentData;
    }): Promise<ContentTypeSnippetModels.ContentTypeSnippet[]> {
        const contentTypeSnippets: ContentTypeSnippetModels.ContentTypeSnippet[] = [];

        for (const importContentTypeSnippet of data.importContentTypeSnippets) {
            const importResult = this.prepareImport(importContentTypeSnippet, data.existingData);

            if (!importResult.canImport) {
                logDebug({
                    type: 'Skip',
                    message: importResult.message,
                    partA: importContentTypeSnippet.codename
                });
                continue;
            }

            logDebug({
                type: 'Import',
                message: importResult.message,
                partA: importContentTypeSnippet.codename
            });

            contentTypeSnippets.push(
                (
                    await data.managementClient
                        .addContentTypeSnippet()
                        .withData((builder) => {
                            return {
                                elements: importContentTypeSnippet.elements,
                                name: importContentTypeSnippet.name,
                                codename: importResult.newCodename ?? importContentTypeSnippet.codename,
                                external_id: importContentTypeSnippet.externalId
                            };
                        })
                        .toPromise()
                ).data
            );
        }

        return contentTypeSnippets;
    }

    private prepareImport(
        snippet: IJsonContentTypeSnippet,
        existingData: ITargetEnvironmentData
    ): {
        canImport: boolean;
        message: string;
        newCodename?: string;
    } {
        if (existingData.contentTypeSnippets.find((m) => m.externalId === snippet.externalId)) {
            return {
                canImport: false,
                message: `Snippet with external id '${snippet.externalId}' already exists`
            };
        } else if (existingData.contentTypeSnippets.find((m) => m.codename === snippet.codename)) {
            const newCodename: string = `${snippet.codename}_${guidHelper.shortGuid()}`;

            return {
                canImport: false,
                newCodename: newCodename,
                message: `Snippet with codename '${snippet.codename}' already exists. Using newly generated codename '${newCodename}' instead.`
            };
        }

        return {
            canImport: true,
            message: 'Importing Snippet'
        };
    }
}

export const importContentTypeSnippetsHelper = new ImportContentTypeSnippetsHelper();
