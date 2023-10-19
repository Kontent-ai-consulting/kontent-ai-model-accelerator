import { IExportAllResult, IExportConfig, IExportData } from './export.models';
import { defaultRetryStrategy, defaultHttpService, printProjectAndEnvironmentInfoToConsoleAsync } from '../core';
import { version } from '../../package.json';
import { logDebug } from '../core/log-helper';
import {
    ContentTypeModels,
    createManagementClient,
    ManagementClient,
    TaxonomyModels
} from '@kontent-ai/management-sdk';

export class ExportService {
    private readonly managementClient: ManagementClient;

    constructor(config: IExportConfig) {
        const retryStrategy = config.retryStrategy ?? defaultRetryStrategy;

        this.managementClient = createManagementClient({
            environmentId: config.environmentId,
            retryStrategy: retryStrategy,
            httpService: defaultHttpService,
            apiKey: config.apiKey,
            baseUrl: config.baseUrl
        });
    }

    async exportAllAsync(): Promise<IExportAllResult> {
        const environment = await printProjectAndEnvironmentInfoToConsoleAsync(this.managementClient);

        const contentTypes = await this.getContentTypesAsync();
        logDebug({
            type: 'Fetch',
            message: `Fetched '${contentTypes.length}' content types`
        });

        const taxonomies = await this.getTaxonomiesAsync();
        logDebug({
            type: 'Fetch',
            message: `Fetched '${taxonomies.length}' taxonomies`,
        });

        const contentTypeSnippets = await this.getContentTypeSnippetsAsync();
        logDebug({
            type: 'Fetch',
            message: `Fetched '${contentTypeSnippets.length}' content type snippets`,
            partA: contentTypeSnippets.length.toString()
        });

        const data: IExportData = {
            contentTypes: contentTypes,
            contentTypeSnippets: contentTypeSnippets,
            taxonomies: taxonomies
        };

        return {
            metadata: {
                name: environment.name,
                created: new Date(),
                packageVersion: version
            },
            data
        };
    }

    private async getTaxonomiesAsync(): Promise<TaxonomyModels.Taxonomy[]> {
        const response = await this.managementClient.listTaxonomies().toAllPromise();
        return response.data.items;
    }

    private async getContentTypeSnippetsAsync(): Promise<ContentTypeModels.ContentType[]> {
        const response = await this.managementClient.listContentTypeSnippets().toAllPromise();
        return response.data.items;
    }

    private async getContentTypesAsync(): Promise<ContentTypeModels.ContentType[]> {
        const response = await this.managementClient.listContentTypes().toAllPromise();
        return response.data.items;
    }
}
