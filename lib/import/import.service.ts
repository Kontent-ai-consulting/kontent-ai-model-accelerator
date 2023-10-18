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
import { logAction } from '../core/log-helper';
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
                logAction('info', `Importing taxonomies`, exportJson.taxonomies.length.toString());
                const importedTaxonomies = await importTaxonomiesHelper.importTaxonomiesAsync({
                    managementClient: this.managementClient,
                    existingData: existingData,
                    importTaxonomies: exportJson.taxonomies
                });
                importedData.taxonomies.push(...importedTaxonomies);
            } else {
                logAction('info', `There are no taxonomies`);
            }

            //  Content type snippets
            if (exportJson.contentTypeSnippets.length) {
                logAction('info', `Importing content type snippets`, exportJson.contentTypeSnippets.length.toString());
                const importedContentTypeSnippets =
                    await importContentTypeSnippetsHelper.importContentTypeSnipppetsAsync({
                        managementClient: this.managementClient,
                        existingData: existingData,
                        importContentTypeSnippets: exportJson.contentTypeSnippets
                    });
                importedData.contentTypeSnippets.push(...importedContentTypeSnippets);
            } else {
                logAction('info', `There are no content type snippets to import`);
            }

            //  Content types
            if (exportJson.contentTypes.length) {
                logAction('info', `Importing content types`, exportJson.contentTypes.length.toString());
                const importedContentTypes = await importContentTypesHelper.importContentTypesAsync({
                    managementClient: this.managementClient,
                    existingData: existingData,
                    importContentTypes: exportJson.contentTypes
                });
                importedData.contentTypes.push(...importedContentTypes);
            } else {
                logAction('info', `There are no content types to import`);
            }

            logAction('info', `Finished import`);
        } catch (error) {
            handleError(error);
        }
        return importedData;
    }

    private async getTargetEnvironmentDataAsync(): Promise<ITargetEnvironmentData> {
        logAction('fetch', 'Fetching existing content types');
        const contentTypes: ContentTypeModels.ContentType[] = (
            await this.managementClient.listContentTypes().toAllPromise()
        ).data.items;

        logAction('fetch', 'Fetching existing content type snippets');
        const contentTypeSnippets: ContentTypeSnippetModels.ContentTypeSnippet[] = (
            await this.managementClient.listContentTypeSnippets().toAllPromise()
        ).data.items;

        logAction('fetch', 'Fetching existing taxonomies');
        const taxonomies: TaxonomyModels.Taxonomy[] = (await this.managementClient.listTaxonomies().toAllPromise()).data
            .items;

        return {
            contentTypes: contentTypes,
            contentTypeSnippets: contentTypeSnippets,
            taxonomies: taxonomies
        };
    }
}
