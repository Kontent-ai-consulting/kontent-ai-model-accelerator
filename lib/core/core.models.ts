import { ContentTypeElements } from '@kontent-ai/management-sdk';

export interface ICliFileConfig {
    environmentId?: string;
    apiKey?: string;
    action: CliAction;
    baseUrl?: string;
    filename?: string;
    model?: string;
    contentTypes?: string[];
    taxonomies?: string[];
    contentTypeSnippets?: string[];
    debug?: boolean;
    force: boolean;
}

export type CliAction = 'export' | 'fileImport' | 'remoteImport' | 'list';

export interface IPackageMetadata {
    project: string;
    environment: string;
    created: Date;
}

export interface IJsonContentType {
    codename: string;
    name: string;
    contentGroups: IJsonContentTypeGroup[];
    elements: IJsonContentTypeElement[];
    externalId: string;
}

export interface IJsonContentTypeSnippet {
    codename: string;
    name: string;
    elements: IJsonContentTypeElement[];
    externalId: string;
}

export interface IJsonContentTypeGroup {
    external_id: string | undefined;
    name: string;
}

export interface IJsonTaxonomy {
    codename: string;
    name: string;
    externalId?: string;
    terms: IJsonTaxonomy[] | undefined;
}

export interface IJsonContentTypeElement extends ContentTypeElements.IElementShared {}

export const getAllAcceleratorsUrl: string = `https://learn.devkontentmasters.com/learn/api/accelerators/getAll`;
