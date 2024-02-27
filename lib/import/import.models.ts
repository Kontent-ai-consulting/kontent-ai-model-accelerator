import { IRetryStrategyOptions } from '@kontent-ai/core-sdk';
import { ContentTypeModels, ContentTypeSnippetModels, TaxonomyModels } from '@kontent-ai/management-sdk';

export interface IImportConfig {
    apiKey: string;
    retryStrategy?: IRetryStrategyOptions;
    baseUrl?: string;
    environmentId: string;
    debug: boolean;
}

export interface IImportedData {
    contentTypes: ContentTypeModels.ContentType[];
    contentTypeSnippets: ContentTypeSnippetModels.ContentTypeSnippet[];
    taxonomies: TaxonomyModels.Taxonomy[];
}

export interface ITargetEnvironmentData {
    contentTypes: ContentTypeModels.ContentType[];
    contentTypeSnippets: ContentTypeSnippetModels.ContentTypeSnippet[];
    taxonomies: TaxonomyModels.Taxonomy[];
}
