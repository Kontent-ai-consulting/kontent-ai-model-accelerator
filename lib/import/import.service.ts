import {
    ContentTypeModels,
    ManagementClient,
    TaxonomyModels,
    ContentTypeSnippetModels
} from '@kontent-ai/management-sdk';

import {
    handleError,
    defaultRetryStrategy,
    printProjectAndEnvironmentInfoToConsoleAsync,
    defaultHttpService
} from '../core';
import { IImportConfig, IImportedData, ITargetEnvironmentData } from './import.models';
import { logDebug } from '../core/log-helper';
import { importContentTypesHelper } from './helpers/import-content-types.helper';
import { IExportJson } from '../export';
import { importContentTypeSnippetsHelper } from './helpers/import-content-type-snippets.helper';
import { importTaxonomiesHelper } from './helpers/import-taxonomies.helper';

export class ImportService {
    private readonly managementClient: ManagementClient;

    constructor(config: IImportConfig) {
        this.managementClient = new ManagementClient({
            apiKey: config.apiKey,
            baseUrl: config.baseUrl,
            environmentId: config.environmentId,
            httpService: defaultHttpService,
            retryStrategy: config.retryStrategy ?? defaultRetryStrategy
        });
    }

    async importAsync(exportJson: IExportJson): Promise<IImportedData> {
        const importedData: IImportedData = {
            contentTypes: [],
            contentTypeSnippets: [],
            taxonomies: []
        };

        await printProjectAndEnvironmentInfoToConsoleAsync(this.managementClient);

        const existingData = await this.getTargetEnvironmentDataAsync();

        try {
            //  Taxonomies
            if (exportJson.taxonomies.length) {
                logDebug({
                    type: 'Info',
                    message: 'Importing taxonomies',
                    partA: exportJson.taxonomies.length.toString()
                });
                const importedTaxonomies = await importTaxonomiesHelper.importTaxonomiesAsync({
                    managementClient: this.managementClient,
                    existingData: existingData,
                    importTaxonomies: exportJson.taxonomies
                });
                importedData.taxonomies.push(...importedTaxonomies);
            } else {
                logDebug({
                    type: 'Info',
                    message: 'There are no taxonomies to import'
                });
            }

            //  Content type snippets
            if (exportJson.contentTypeSnippets.length) {
                logDebug({
                    type: 'Info',
                    message: 'Importing content type snippets',
                    partA: exportJson.contentTypeSnippets.length.toString()
                });

                const importedContentTypeSnippets =
                    await importContentTypeSnippetsHelper.importContentTypeSnipppetsAsync({
                        managementClient: this.managementClient,
                        existingData: existingData,
                        importContentTypeSnippets: exportJson.contentTypeSnippets
                    });
                importedData.contentTypeSnippets.push(...importedContentTypeSnippets);
            } else {
                logDebug({
                    type: 'Info',
                    message: 'There are no content type snippets to import'
                });
            }

            //  Content types
            if (exportJson.contentTypes.length) {
                logDebug({
                    type: 'Info',
                    message: 'Importing content types',
                    partA: exportJson.contentTypes.length.toString()
                });
                const importedContentTypes = await importContentTypesHelper.importContentTypesAsync({
                    managementClient: this.managementClient,
                    existingData: existingData,
                    importContentTypes: exportJson.contentTypes
                });
                importedData.contentTypes.push(...importedContentTypes);
            } else {
                logDebug({
                    type: 'Info',
                    message: 'There are no content types to import',
                    partA: exportJson.taxonomies.length.toString()
                });
            }

            logDebug({
                type: 'Info',
                message: 'Importing taxonomies',
                partA: exportJson.taxonomies.length.toString()
            });
            logDebug({
                type: 'Info',
                message: 'Import finished'
            });
        } catch (error) {
            handleError(error);
        }
        return importedData;
    }

    private async getTargetEnvironmentDataAsync(): Promise<ITargetEnvironmentData> {
        const contentTypes: ContentTypeModels.ContentType[] = (
            await this.managementClient.listContentTypes().toAllPromise()
        ).data.items;

        logDebug({
            type: 'Fetch',
            message: 'Fetched existing content types',
            partA: contentTypes.length.toString()
        });

        const contentTypeSnippets: ContentTypeSnippetModels.ContentTypeSnippet[] = (
            await this.managementClient.listContentTypeSnippets().toAllPromise()
        ).data.items;

        logDebug({
            type: 'Fetch',
            message: 'Fetched existing content type snippets',
            partA: contentTypeSnippets.length.toString()
        });

        const taxonomies: TaxonomyModels.Taxonomy[] = (await this.managementClient.listTaxonomies().toAllPromise()).data
            .items;

        logDebug({
            type: 'Fetch',
            message: 'Fetched taxonomies',
            partA: taxonomies.length.toString()
        });

        return {
            contentTypes: contentTypes,
            contentTypeSnippets: contentTypeSnippets,
            taxonomies: taxonomies
        };
    }
}
