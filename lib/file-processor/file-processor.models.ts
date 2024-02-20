import { ContentTypeModels, ContentTypeSnippetModels, TaxonomyModels } from '@kontent-ai/management-sdk';
import { IJsonContentType, IJsonContentTypeSnippet, IJsonTaxonomy } from 'lib/core/index.js';

export interface IContentTypeFormatService {
    transformAsync(types: ContentTypeModels.ContentType[]): Promise<IJsonContentType[]>;
}

export interface IContentTypeSnippetsFormatService {
    transformAsync(snippets: ContentTypeSnippetModels.ContentTypeSnippet[]): Promise<IJsonContentTypeSnippet[]>;
}

export interface ITaxonomiesFormatService {
    transformAsync(types: TaxonomyModels.Taxonomy[]): Promise<IJsonTaxonomy[]>;
}
