import { ContentTypeElements } from '@kontent-ai/management-sdk';

export interface ICliFileConfig {
    environmentId?: string;
    apiKey?: string;
    action: CliAction;
    baseUrl?: string;
    filename?: string;
    remoteProject?: string;
}

export type CliAction = 'export' | 'fileImport' | 'remoteImport' | 'list';

export interface IPackageMetadata {
    name: string;
    packageVersion: string;
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
