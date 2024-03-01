import { IManagementClient, EnvironmentModels, SharedModels, ContentTypeElements } from '@kontent-ai/management-sdk';
import colors from 'colors';

import { Log, exitProcess, logErrorAndExit } from './log-helper.js';

import { DeliveryError } from '@kontent-ai/delivery-sdk';
import prompts from 'prompts';
import { ImportService } from '../import/index.js';
import { IExportJson } from '../export/index.js';
import { ITrackingEventData, getTrackingService } from '@kontent-ai-consulting/tools-analytics';
import { IJsonContentType, IJsonContentTypeSnippet, IJsonTaxonomy, IPackageMetadata } from './core.models.js';

export interface IErrorData {
    message: string;
    requestData?: string;
    requestUrl?: string;
}

export interface IFilteredSelectedObjects {
    contentTypes: IJsonContentType[];
    contentTypeSnippets: IJsonContentTypeSnippet[];
    taxonomies: IJsonTaxonomy[];
}

export function sleepAsync(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function is404Error(error: any): boolean {
    if (
        error instanceof SharedModels.ContentManagementBaseKontentError &&
        error.originalError?.response?.status === 404
    ) {
        return true;
    }
    if (error instanceof DeliveryError && error.errorCode === 100) {
        return true;
    }

    return false;
}

export async function printEnvironmentInfoToConsoleAsync(
    log: Log | undefined,
    client: IManagementClient<any>
): Promise<EnvironmentModels.EnvironmentInformationModel> {
    const environmentInformation = await getEnvironmentInfoAsync(client);

    log?.({
        type: 'Info',
        message: `Using environment '${colors.yellow(environmentInformation.environment)}' from project '${colors.cyan(
            environmentInformation.name
        )}'`
    });

    return environmentInformation;
}

export async function getEnvironmentInfoAsync(
    client: IManagementClient<any>
): Promise<EnvironmentModels.EnvironmentInformationModel> {
    const environmentInformation = (await client.environmentInformation().toPromise()).data;

    return environmentInformation.project;
}

export function extractErrorData(error: any): IErrorData {
    let message: string = `Unknown error`;
    let requestUrl: string | undefined = undefined;
    let requestData: string | undefined = undefined;

    if (error instanceof SharedModels.ContentManagementBaseKontentError) {
        message = `${error.message}`;
        requestUrl = error.originalError?.response?.config.url;
        requestData = error.originalError?.response?.config.data;

        for (const validationError of error.validationErrors) {
            message += ` ${validationError.message}`;
        }
    } else if (error instanceof Error) {
        message = error.message;
    }

    return {
        message: message,
        requestData: requestData,
        requestUrl: requestUrl
    };
}

export function handleError(error: any): void {
    const errorData = extractErrorData(error);

    if (errorData.requestUrl) {
        console.log(`${colors.red('Request url')}: ${errorData.requestUrl}`);
    }
    if (errorData.requestData) {
        console.log(`${colors.red('Request data')}: ${errorData.requestData}`);
    }

    logErrorAndExit({
        message: errorData.message
    });
}

export async function confirmImportAsync(data: {
    log?: Log;
    force: boolean;
    importService: ImportService;
}): Promise<void> {
    const targetEnvironment = await data.importService.getEnvironmentInfoAsync();

    if (data.force) {
        data.log?.({
            type: 'Info',
            message: `Skipping target environment confirmation due to the use of force param`
        });
    } else {
        const confirmed = await prompts({
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure to import models into ${colors.yellow(
                targetEnvironment.environment
            )} environment of project ${colors.cyan(targetEnvironment.name)}?`
        });

        if (!confirmed.confirm) {
            data.log?.({
                type: 'Cancel',
                message: `Confirmation refused.`
            });
            exitProcess();
        }
    }
}
export async function confirmDataToImportAsync(data: {
    log?: Log;
    force: boolean;
    metadata: IPackageMetadata;
    dataToImport: IFilteredSelectedObjects;
}): Promise<void> {
    if (data.force) {
        data.log?.({
            type: 'Info',
            message: `Skipping data confirmation due to the use of force param`
        });
    } else {
        if (data.metadata.environment) {
            data.log?.({
                type: 'Model',
                message: `${data.metadata.environment}`
            });
        }
        data.log?.({
            type: 'Content Types',
            message: data.dataToImport.contentTypes.length
                ? data.dataToImport.contentTypes.map((m) => m.name)?.join(', ')
                : colors.gray('none')
        });
        data.log?.({
            type: 'Snippets',
            message: data.dataToImport.contentTypeSnippets.length
                ? data.dataToImport.contentTypeSnippets.map((m) => m.name)?.join(', ')
                : colors.gray('none')
        });
        data.log?.({
            type: 'Taxonomies',
            message: data.dataToImport.taxonomies.length
                ? data.dataToImport.taxonomies.map((m) => m.name)?.join(', ')
                : colors.gray('none')
        });

        const confirmed = await prompts({
            type: 'confirm',
            name: 'confirm',
            message: `Import the models above into target environment?`
        });

        if (!confirmed.confirm) {
            data.log?.({
                type: 'Cancel',
                message: `Confirmation refused.`
            });
            exitProcess();
        }
    }
}

export async function executeWithTrackingAsync<TResult>(data: {
    func: () => Promise<TResult>;
    event: ITrackingEventData;
}): Promise<TResult> {
    const trackingService = getTrackingService();
    const event = await trackingService.trackEventAsync(data.event);

    try {
        const result = await data.func();

        await trackingService.setEventResultAsync({
            eventId: event.eventId,
            result: 'success'
        });

        return result;
    } catch (error) {
        await trackingService.setEventResultAsync({
            eventId: event.eventId,
            result: 'fail'
        });

        throw error;
    }
}

export function filterSelectedObjectsToImport(data: {
    selectedContentTypes: string[];
    selectedContentTypeSnippets: string[];
    selectedTaxonomies: string[];
    exportJson: IExportJson;
}): IFilteredSelectedObjects {
    const importAll: boolean =
        !data.selectedContentTypeSnippets.length && !data.selectedContentTypes && !data.selectedTaxonomies;

    if (importAll) {
        return {
            contentTypeSnippets: data.exportJson.contentTypeSnippets ?? [],
            contentTypes: data.exportJson.contentTypes ?? [],
            taxonomies: data.exportJson.taxonomies ?? []
        };
    }

    const contentTypesToImport: IJsonContentType[] = [];
    const contentTypeSnippetsToImport: IJsonContentTypeSnippet[] = [];
    const taxonomiesToImport: IJsonTaxonomy[] = [];

    for (const selectedContentType of data.selectedContentTypes) {
        const exportContentType = data.exportJson.contentTypes?.find(
            (m) => m.codename.toLowerCase() === selectedContentType.toLowerCase()
        );

        if (!exportContentType) {
            throw Error(`Invalid selected content type with codename '${colors.yellow(selectedContentType)}'`);
        }

        contentTypesToImport.push(exportContentType);

        // when selected content type is used, also import all used taxonomies / snippets within the type
        for (const element of exportContentType.elements) {
            if (element.type === 'snippet') {
                const snippetElement = element as ContentTypeElements.ISnippetElement;
                const embeddedSnippet = data.exportJson.contentTypeSnippets?.find(
                    (m) => m.externalId?.toLowerCase() === snippetElement.snippet.external_id?.toLowerCase()
                );

                if (!embeddedSnippet) {
                    throw Error(
                        `Invalid snippet with external id '${colors.yellow(
                            snippetElement.snippet.external_id ?? ''
                        )}' used within content type '${colors.yellow(selectedContentType)}'`
                    );
                }

                contentTypeSnippetsToImport.push(embeddedSnippet);
            } else if (element.type === 'taxonomy') {
                const taxonomyElement = element as ContentTypeElements.ITaxonomyElement;
                const embeddedTaxonomy = data.exportJson.taxonomies?.find(
                    (m) => m.externalId?.toLowerCase() === taxonomyElement.taxonomy_group.external_id?.toLowerCase()
                );

                if (!embeddedTaxonomy) {
                    throw Error(
                        `Invalid taxonomy with external id '${colors.yellow(
                            taxonomyElement.taxonomy_group.external_id ?? ''
                        )}' used within content type '${colors.yellow(selectedContentType)}'`
                    );
                }

                taxonomiesToImport.push(embeddedTaxonomy);
            }
        }
    }

    for (const selectedContentTypeSnippet of data.selectedContentTypeSnippets) {
        const exportContentTypeSnippet = data.exportJson.contentTypeSnippets?.find(
            (m) => m.codename.toLowerCase() === selectedContentTypeSnippet.toLowerCase()
        );

        if (!exportContentTypeSnippet) {
            throw Error(
                `Invalid selected content type snippet with codename '${colors.yellow(selectedContentTypeSnippet)}'`
            );
        }

        contentTypeSnippetsToImport.push(exportContentTypeSnippet);

        // when selected content type snippet is used, also import all used taxonomies
        for (const element of exportContentTypeSnippet.elements) {
            if (element.type === 'taxonomy') {
                const taxonomyElement = element as ContentTypeElements.ITaxonomyElement;
                const embeddedTaxonomy = data.exportJson.taxonomies?.find(
                    (m) => m.externalId?.toLowerCase() === taxonomyElement.taxonomy_group.external_id?.toLowerCase()
                );

                if (!embeddedTaxonomy) {
                    throw Error(
                        `Invalid taxonomy with external id '${colors.yellow(
                            taxonomyElement.taxonomy_group.external_id ?? ''
                        )}' used within snippet '${colors.yellow(exportContentTypeSnippet.codename)}'`
                    );
                }

                taxonomiesToImport.push(embeddedTaxonomy);
            }
        }
    }

    for (const selectedTaxonomy of data.selectedTaxonomies) {
        const exportTaxonomy = data.exportJson.taxonomies?.find(
            (m) => m.codename.toLowerCase() === selectedTaxonomy.toLowerCase()
        );

        if (!exportTaxonomy) {
            throw Error(`Invalid selected taxonomy codename '${colors.yellow(selectedTaxonomy)}'`);
        }

        taxonomiesToImport.push(exportTaxonomy);
    }

    return {
        contentTypeSnippets: contentTypeSnippetsToImport,
        contentTypes: contentTypesToImport,
        taxonomies: taxonomiesToImport
    };
}
