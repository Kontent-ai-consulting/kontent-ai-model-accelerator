import { IManagementClient, EnvironmentModels, SharedModels } from '@kontent-ai/management-sdk';
import colors from 'colors';

import { exitProcess, logDebug, logErrorAndExit } from './log-helper.js';

import { DeliveryError } from '@kontent-ai/delivery-sdk';
import prompts from 'prompts';
import { ImportService } from '../import/index.js';
import { IExportJson } from '../export/index.js';
import { ITrackingEventData, getTrackingService } from '@kontent-ai-consulting/tools-analytics';

export interface IErrorData {
    message: string;
    requestData?: string;
    requestUrl?: string;
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
    client: IManagementClient<any>
): Promise<EnvironmentModels.EnvironmentInformationModel> {
    const environmentInformation = await getEnvironmentInfoAsync(client);

    logDebug({
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
        logDebug({
            type: 'Error',
            message: errorData.requestUrl,
            partA: 'Request Url'
        });
    }

    if (errorData.requestData) {
        logDebug({
            type: 'Error',
            message: errorData.requestData,
            partA: 'Request Data'
        });
    }

    logErrorAndExit({
        message: errorData.message
    });
}

export async function confirmImportAsync(data: { force: boolean; importService: ImportService }): Promise<void> {
    const targetEnvironment = await data.importService.getEnvironmentInfoAsync();

    if (data.force) {
        logDebug({
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
            logDebug({
                type: 'Cancel',
                message: `Confirmation refused. Exiting process.`
            });
            exitProcess();
        }
    }
}
export async function confirmDataToImportAsync(data: { force: boolean; exportJson: IExportJson }): Promise<void> {
    if (data.force) {
        logDebug({
            type: 'Info',
            message: `Skipping data confirmation due to the use of force param`
        });
    } else {
        if (data.exportJson.metadata.environment) {
            logDebug({
                type: 'Model',
                message: `${colors.yellow(data.exportJson.metadata.environment)}`
            });
        }
        logDebug({
            type: 'Content Types',
            message: `${data.exportJson.contentTypes?.map((m) => m.name)?.join(', ')}`,
            partA: (data.exportJson.contentTypes?.length ?? 0).toString()
        });
        logDebug({
            type: 'Snippets',
            message: `${data.exportJson.contentTypeSnippets?.map((m) => m.name)?.join(', ')}`,
            partA: (data.exportJson.contentTypeSnippets?.length ?? 0).toString()
        });
        logDebug({
            type: 'Taxonomies',
            message: `${data.exportJson.taxonomies?.map((m) => m.name)?.join(', ')}`,
            partA: (data.exportJson.taxonomies?.length ?? 0).toString()
        });

        const confirmed = await prompts({
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure to import models above into target environment?`
        });

        if (!confirmed.confirm) {
            logDebug({
                type: 'Cancel',
                message: `Confirmation refused. Exiting process.`
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
