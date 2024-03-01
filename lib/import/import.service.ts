import {
    ContentTypeModels,
    ManagementClient,
    TaxonomyModels,
    ContentTypeSnippetModels,
    EnvironmentModels
} from '@kontent-ai/management-sdk';
import colors from 'colors';
import {
    handleError,
    defaultRetryStrategy,
    defaultHttpService,
    getEnvironmentInfoAsync,
    executeWithTrackingAsync,
    IFilteredSelectedObjects
} from '../core/index.js';
import { IImportConfig, IImportedData, ITargetEnvironmentData } from './import.models.js';
import { IExportJson } from '../export/index.js';
import { libMetadata } from '../metadata.js';
import { getImportTaxonomiesHelper } from './helpers/import-taxonomies.helper.js';
import { getImportContentTypeSnippetsHelper } from './helpers/import-content-type-snippets.helper.js';
import { getImportContentTypesHelper } from './helpers/import-content-types.helper.js';

export class ImportService {
    private readonly managementClient: ManagementClient;

    constructor(private readonly config: IImportConfig) {
        this.managementClient = new ManagementClient({
            apiKey: config.apiKey,
            baseUrl: config.baseUrl,
            environmentId: config.environmentId,
            httpService: defaultHttpService,
            retryStrategy: config.retryStrategy ?? defaultRetryStrategy
        });
    }

    getEnvironmentInfoAsync(): Promise<EnvironmentModels.EnvironmentInformationModel> {
        return getEnvironmentInfoAsync(this.managementClient);
    }

    async importAsync(data: {
        exportJson: IExportJson;
        dataToImport: IFilteredSelectedObjects;
    }): Promise<IImportedData> {
        return await executeWithTrackingAsync({
            event: {
                action: 'import',
                package: {
                    name: libMetadata.name,
                    version: libMetadata.version
                },
                tool: 'contentModelAccelerator',
                result: 'unknown',
                relatedEnvironmentId: this.config.environmentId,
                details: {
                    metadata: data.exportJson.metadata
                }
            },
            func: async () => {
                const importedData: IImportedData = {
                    contentTypes: [],
                    contentTypeSnippets: [],
                    taxonomies: []
                };

                const existingData = await this.getTargetEnvironmentDataAsync();

                try {
                    //  Taxonomies
                    if (data.dataToImport.taxonomies.length) {
                        this.config.log?.({
                            type: 'Info',
                            message: `Preparing to import '${colors.yellow(
                                data.dataToImport.taxonomies.length.toString()
                            )}' taxonomies`
                        });
                        const importedTaxonomies = await getImportTaxonomiesHelper(
                            this.config.log
                        ).importTaxonomiesAsync({
                            managementClient: this.managementClient,
                            existingData: existingData,
                            importTaxonomies: data.dataToImport.taxonomies
                        });
                        importedData.taxonomies.push(...importedTaxonomies);
                    } else {
                        this.config.log?.({
                            type: 'Info',
                            message: 'There are no taxonomies to import'
                        });
                    }

                    //  Content type snippets
                    if (data.dataToImport.contentTypeSnippets.length) {
                        this.config.log?.({
                            type: 'Info',
                            message: `Preparing to import '${colors.yellow(
                                data.dataToImport.contentTypeSnippets.length.toString()
                            )}' content type snippets`
                        });

                        const importedContentTypeSnippets = await getImportContentTypeSnippetsHelper(
                            this.config.log
                        ).importContentTypeSnipppetsAsync({
                            managementClient: this.managementClient,
                            existingData: existingData,
                            importContentTypeSnippets: data.dataToImport.contentTypeSnippets
                        });
                        importedData.contentTypeSnippets.push(...importedContentTypeSnippets);
                    } else {
                        this.config.log?.({
                            type: 'Info',
                            message: 'There are no content type snippets to import'
                        });
                    }

                    //  Content types
                    if (data.dataToImport.contentTypes.length) {
                        this.config.log?.({
                            type: 'Info',
                            message: `Preparing to import '${colors.yellow(
                                data.dataToImport.contentTypes.length.toString()
                            )}' content types`
                        });
                        const importedContentTypes = await getImportContentTypesHelper(
                            this.config.log
                        ).importContentTypesAsync({
                            managementClient: this.managementClient,
                            existingData: existingData,
                            importContentTypes: data.dataToImport.contentTypes
                        });
                        importedData.contentTypes.push(...importedContentTypes);
                    } else {
                        this.config.log?.({
                            type: 'Info',
                            message: 'There are no content types to import'
                        });
                    }

                    this.config.log?.({
                        type: 'Info',
                        message: 'Import finished'
                    });
                } catch (error) {
                    handleError(error);
                }
                return importedData;
            }
        });
    }

    private async getTargetEnvironmentDataAsync(): Promise<ITargetEnvironmentData> {
        const contentTypes: ContentTypeModels.ContentType[] = (
            await this.managementClient.listContentTypes().toAllPromise()
        ).data.items;

        this.config.log?.({
            type: 'Fetch',
            message: `Fetched '${colors.yellow(contentTypes.length.toString())}' existing content types`
        });

        const contentTypeSnippets: ContentTypeSnippetModels.ContentTypeSnippet[] = (
            await this.managementClient.listContentTypeSnippets().toAllPromise()
        ).data.items;

        this.config.log?.({
            type: 'Fetch',
            message: `Fetched '${colors.yellow(contentTypeSnippets.length.toString())}' existing content type snippets`
        });

        const taxonomies: TaxonomyModels.Taxonomy[] = (await this.managementClient.listTaxonomies().toAllPromise()).data
            .items;

        this.config.log?.({
            type: 'Fetch',
            message: `Fetched '${colors.yellow(taxonomies.length.toString())}' existing taxonomies`
        });

        return {
            contentTypes: contentTypes,
            contentTypeSnippets: contentTypeSnippets,
            taxonomies: taxonomies
        };
    }
}
