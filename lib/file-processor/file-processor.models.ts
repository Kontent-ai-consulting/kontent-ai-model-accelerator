import { ContentTypeModels, ContentTypeSnippetModels, TaxonomyModels } from '@kontent-ai/management-sdk';
import { IJsonContentType, IJsonContentTypeSnippet, IJsonTaxonomy } from 'lib/core';

export type ProcessingFormat = 'json';

export interface IContentTypeFormatService {
    name: string;

    transformAsync(types: ContentTypeModels.ContentType[]): Promise<IJsonContentType[]>;
    parseAsync(text: string): Promise<IJsonContentType[]>;
}

export interface IContentTypeSnippetsFormatService {
    name: string;

    transformAsync(snippets: ContentTypeSnippetModels.ContentTypeSnippet[]): Promise<IJsonContentTypeSnippet[]>;
    parseAsync(text: string): Promise<IJsonContentTypeSnippet[]>;
}

export interface ITaxonomiesFormatService {
    name: string;

    transformAsync(types: TaxonomyModels.Taxonomy[]): Promise<IJsonTaxonomy[]>;
    parseAsync(text: string): Promise<IJsonTaxonomy[]>;
}
