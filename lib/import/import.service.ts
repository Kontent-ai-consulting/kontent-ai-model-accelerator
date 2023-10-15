import { ManagementClient } from '@kontent-ai/management-sdk';

import {
    handleError,
    defaultRetryStrategy,
    printProjectAndEnvironmentInfoToConsoleAsync,
    defaultHttpService
} from '../core';
import { IImportConfig, IImportSource, IImportedData } from './import.models';
import { logAction } from '../core/log-helper';
import { importContentTypesHelper } from './helpers/import-content-types.helper';

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

    async importAsync(sourceData: IImportSource): Promise<IImportedData> {
        const importedData: IImportedData = {
            contentTypes: []
        };

        await printProjectAndEnvironmentInfoToConsoleAsync(this.managementClient);

        try {
            //  Content types
            if (sourceData.contentTypes.length) {
                logAction('info', `Importing content types`, sourceData.contentTypes.length.toString());
                const importedContentTypes = await importContentTypesHelper.importContentTypesAsync(
                    this.managementClient,
                    sourceData.contentTypes
                );
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
}
