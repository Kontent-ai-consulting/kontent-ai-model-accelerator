import { IManagementClient, EnvironmentModels, SharedModels } from '@kontent-ai/management-sdk';
import { IRetryStrategyOptions } from '@kontent-ai/core-sdk';

import { logDebug } from './log-helper.js';

import { HttpService } from '@kontent-ai/core-sdk';
import { DeliveryError } from '@kontent-ai/delivery-sdk';

const rateExceededErrorCode: number = 10000;

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

export async function printProjectAndEnvironmentInfoToConsoleAsync(
    client: IManagementClient<any>
): Promise<EnvironmentModels.EnvironmentInformationModel> {
    const environmentInformation = (await client.environmentInformation().toPromise()).data;

    logDebug({
        type: 'Info',
        message: `Using accelerator model ${environmentInformation.project.environment}`,
        partA: environmentInformation.project.name
    });

    return environmentInformation.project;
}

export function extractErrorMessage(error: any): string {
    if (error instanceof SharedModels.ContentManagementBaseKontentError) {
        let message: string = `${error.message}`;

        for (const validationError of error.validationErrors) {
            message += ` ${validationError.message}`;
        }
        return message;
    }
    if (error instanceof Error) {
        return error.message;
    }

    return `Unknown error`;
}

export function handleError(error: any | SharedModels.ContentManagementBaseKontentError): void {
    throw error;
}
