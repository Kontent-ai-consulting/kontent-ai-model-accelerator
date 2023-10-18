import { IRetryStrategyOptions } from '@kontent-ai/core-sdk';
import { ContentTypeModels, ContentTypeSnippetModels, TaxonomyModels } from '@kontent-ai/management-sdk';
import { IJsonContentType, IJsonContentTypeSnippet, IJsonTaxonomy, IPackageMetadata } from 'lib/core';

export interface IExportConfig {
    environmentId: string;
    apiKey: string;
    baseUrl?: string;
    retryStrategy?: IRetryStrategyOptions;
}

export interface IExportData {
    taxonomies: TaxonomyModels.Taxonomy[];
    contentTypes: ContentTypeModels.ContentType[];
    contentTypeSnippets: ContentTypeSnippetModels.ContentTypeSnippet[];
}

export interface IExportAllResult {
    data: IExportData;
    metadata: IPackageMetadata;
}

export interface IExportJson {
    metadata: IPackageMetadata;
    contentTypes: IJsonContentType[];
    contentTypeSnippets: IJsonContentTypeSnippet[];
    taxonomies: IJsonTaxonomy[];
}
