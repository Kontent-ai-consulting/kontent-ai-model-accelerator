import { IRetryStrategyOptions } from '@kontent-ai/core-sdk';
import { ContentTypeModels } from '@kontent-ai/management-sdk';
import { IJsonContentType } from 'lib/core';

export interface IImportConfig {
    apiKey: string;
    retryStrategy?: IRetryStrategyOptions;
    baseUrl?: string;
    environmentId: string;
}

export interface IImportSource {
    contentTypes: IJsonContentType[];
}

export interface IImportedData {
    contentTypes: ContentTypeModels.ContentType[];
}
