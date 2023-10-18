import { IExportAllResult, IExportConfig, IExportData } from './export.models';
import { defaultRetryStrategy, defaultHttpService, printProjectAndEnvironmentInfoToConsoleAsync } from '../core';
import { version } from '../../package.json';
import { logAction } from '../core/log-helper';
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
        logAction('fetch', `Loaded '${contentTypes.length}' content types`);

        const taxonomies = await this.getTaxonomiesAsync();
        logAction('fetch', `Loaded '${taxonomies.length}' taxonomies`);

        const contentTypeSnippets = await this.getContentTypeSnippetsAsync();
        logAction('fetch', `Loaded '${contentTypes.length}' content type snippets`);

        const data: IExportData = {
            contentTypes: contentTypes,
            contentTypeSnippets: contentTypeSnippets,
            taxonomies: taxonomies
        };

        return {
            metadata: {
                name: environment.name,
                created: new Date(),
                sdkVersion: version,
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