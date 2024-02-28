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
    IJsonContentType,
    IJsonContentTypeSnippet,
    IJsonTaxonomy,
    getEnvironmentInfoAsync,
    executeWithTrackingAsync
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
        selectedContentTypes: string[];
        selectedTaxonomies: string[];
        selectedContentTypeSnippets: string[];
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

                const dataToImport = this.getDataToImport(data);
                const existingData = await this.getTargetEnvironmentDataAsync();

                try {
                    //  Taxonomies
                    if (dataToImport.taxonomies.length) {
                        this.config.log?.({
                            type: 'Info',
                            message: `Preparing to import '${colors.yellow(
                                dataToImport.taxonomies.length.toString()
                            )}' taxonomies`
                        });
                        const importedTaxonomies = await getImportTaxonomiesHelper(
                            this.config.log
                        ).importTaxonomiesAsync({
                            managementClient: this.managementClient,
                            existingData: existingData,
                            importTaxonomies: dataToImport.taxonomies
                        });
                        importedData.taxonomies.push(...importedTaxonomies);
                    } else {
                        this.config.log?.({
                            type: 'Info',
                            message: 'There are no taxonomies to import'
                        });
                    }

                    //  Content type snippets
                    if (dataToImport.contentTypeSnippets.length) {
                        this.config.log?.({
                            type: 'Info',
                            message: `Preparing to import '${colors.yellow(
                                dataToImport.contentTypeSnippets.length.toString()
                            )}' content type snippets`
                        });

                        const importedContentTypeSnippets = await getImportContentTypeSnippetsHelper(
                            this.config.log
                        ).importContentTypeSnipppetsAsync({
                            managementClient: this.managementClient,
                            existingData: existingData,
                            importContentTypeSnippets: dataToImport.contentTypeSnippets
                        });
                        importedData.contentTypeSnippets.push(...importedContentTypeSnippets);
                    } else {
                        this.config.log?.({
                            type: 'Info',
                            message: 'There are no content type snippets to import'
                        });
                    }

                    //  Content types
                    if (dataToImport.contentTypes.length) {
                        this.config.log?.({
                            type: 'Info',
                            message: `Preparing to import '${colors.yellow(
                                dataToImport.contentTypes.length.toString()
                            )}' content types`
                        });
                        const importedContentTypes = await getImportContentTypesHelper(
                            this.config.log
                        ).importContentTypesAsync({
                            managementClient: this.managementClient,
                            existingData: existingData,
                            importContentTypes: dataToImport.contentTypes
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

    private getDataToImport(data: {
        exportJson: IExportJson;
        selectedContentTypes: string[];
        selectedTaxonomies: string[];
        selectedContentTypeSnippets: string[];
    }): {
        contentTypes: IJsonContentType[];
        contentTypeSnippets: IJsonContentTypeSnippet[];
        taxonomies: IJsonTaxonomy[];
    } {
        const contentTypesToImport: IJsonContentType[] = [];
        const contentTypeSnippetsToImport: IJsonContentTypeSnippet[] = [];
        const taxonomiesToImport: IJsonTaxonomy[] = [];

        // filter content types
        if (data.selectedContentTypes.length === 0) {
            if (data.exportJson.contentTypes?.length) {
                contentTypesToImport.push(...data.exportJson.contentTypes);
            }
        } else {
            for (const selectedContentTypeCodename of data.selectedContentTypes) {
                const foundContentType = data.exportJson.contentTypes?.find(
                    (m) => m.codename.toLowerCase() === selectedContentTypeCodename.toLocaleLowerCase()
                );

                if (foundContentType) {
                    contentTypesToImport.push(foundContentType);
                } else {
                    this.config.log?.({
                        type: 'Warning',
                        message: `Could not find content type with codename '${colors.yellow(
                            selectedContentTypeCodename
                        )}'`
                    });
                }
            }
        }

        // filter content type snippets
        if (data.selectedContentTypeSnippets.length === 0) {
            if (data.exportJson.contentTypeSnippets?.length) {
                contentTypeSnippetsToImport.push(...data.exportJson.contentTypeSnippets);
            }
        } else {
            for (const selectedContentTypeSnippetCodename of data.selectedContentTypeSnippets) {
                const foundContentTypeSnippet = data.exportJson.contentTypeSnippets?.find(
                    (m) => m.codename.toLowerCase() === selectedContentTypeSnippetCodename.toLocaleLowerCase()
                );

                if (foundContentTypeSnippet) {
                    contentTypeSnippetsToImport.push(foundContentTypeSnippet);
                } else {
                    this.config.log?.({
                        type: 'Warning',
                        message: `Could not find content type snippet with codename '${colors.yellow(
                            selectedContentTypeSnippetCodename
                        )}'`
                    });
                }
            }
        }

        // filter taxonomies
        if (data.selectedTaxonomies.length === 0) {
            if (data.exportJson.taxonomies?.length) {
                taxonomiesToImport.push(...data.exportJson.taxonomies);
            }
        } else {
            for (const selectedTaxonomyCodename of data.selectedTaxonomies) {
                const foundTaxonomy = data.exportJson.taxonomies?.find(
                    (m) => m.codename.toLowerCase() === selectedTaxonomyCodename.toLocaleLowerCase()
                );

                if (foundTaxonomy) {
                    taxonomiesToImport.push(foundTaxonomy);
                } else {
                    this.config.log?.({
                        type: 'Warning',
                        message: `Could not find taxonomy with codename '${selectedTaxonomyCodename}'`
                    });
                }
            }
        }

        return {
            contentTypes: contentTypesToImport,
            contentTypeSnippets: contentTypeSnippetsToImport,
            taxonomies: taxonomiesToImport
        };
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
