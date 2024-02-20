import { IManagementClient, EnvironmentModels, SharedModels } from '@kontent-ai/management-sdk';
import { IRetryStrategyOptions } from '@kontent-ai/core-sdk';
import colors from 'colors';

import { exitProcess, logDebug, logErrorAndExit } from './log-helper.js';

import { HttpService } from '@kontent-ai/core-sdk';
import { DeliveryError } from '@kontent-ai/delivery-sdk';
import { ImportService } from 'lib/index.js';
import prompts from 'prompts';

const rateExceededErrorCode: number = 10000;

export interface IErrorData {
    message: string;
    requestData?: string;
    requestUrl?: string;
}

export const defaultHttpService: HttpService = new HttpService({
    logErrorsToConsole: false
});

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

export const defaultRetryStrategy: IRetryStrategyOptions = {
    addJitter: true,
    canRetryError: (err) => {
        // do not retry failed request from Kontent.ai
        const errorCode = err?.response?.data?.error_code ?? -1;
        if (errorCode >= 0 && errorCode !== rateExceededErrorCode) {
            return false;
        }
        return true;
    },
    maxAttempts: 3,
    deltaBackoffMs: 1000
};

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
            message: `Skipping confirmation due to the use of force param`
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
