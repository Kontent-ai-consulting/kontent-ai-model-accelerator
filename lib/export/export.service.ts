import { IExportAllResult, IExportConfig, IExportData } from './export.models.js';
import colors from 'colors';
import {
    defaultRetryStrategy,
    defaultHttpService,
    printEnvironmentInfoToConsoleAsync,
    logDebug,
    executeWithTrackingAsync
} from '../core/index.js';
import {
    ContentTypeModels,
    createManagementClient,
    ManagementClient,
    TaxonomyModels
} from '@kontent-ai/management-sdk';
import { libMetadata } from '../metadata.js';

export class ExportService {
    private readonly managementClient: ManagementClient;

    constructor(private readonly config: IExportConfig) {
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
        return await executeWithTrackingAsync({
            event: {
                action: 'export',
                tool: 'contentModelAccelerator',
                package: {
                    name: libMetadata.name,
                    version: libMetadata.version
                },
                result: 'unknown',
                relatedEnvironmentId: this.config.environmentId
            },
            func: async () => {
                const environment = await printEnvironmentInfoToConsoleAsync(this.managementClient);
                const contentTypes = await this.getContentTypesAsync();
                logDebug({
                    type: 'Fetch',
                    message: `Fetched '${colors.yellow(contentTypes.length.toString())}' content types`
                });

                const taxonomies = await this.getTaxonomiesAsync();
                logDebug({
                    type: 'Fetch',
                    message: `Fetched '${colors.yellow(taxonomies.length.toString())}' taxonomies`
                });

                const contentTypeSnippets = await this.getContentTypeSnippetsAsync();
                logDebug({
                    type: 'Fetch',
                    message: `Fetched '${colors.yellow(contentTypeSnippets.length.toString())}' content type snippets`,
                    partA: contentTypeSnippets.length.toString()
                });

                const data: IExportData = {
                    contentTypes: contentTypes,
                    contentTypeSnippets: contentTypeSnippets,
                    taxonomies: taxonomies
                };

                return {
                    metadata: {
                        project: environment.name,
                        environment: environment.environment,
                        created: new Date()
                    },
                    data
                };
            }
        });
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
