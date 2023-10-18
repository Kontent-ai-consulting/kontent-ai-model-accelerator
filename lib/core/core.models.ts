import { ElementContracts } from '@kontent-ai/management-sdk';

export interface ICliFileConfig {
    environmentId: string;
    apiKey: string;
    action: CliAction;
    baseUrl?: string;
    filename?: string;
}

export type CliAction = 'export' | 'import';

export interface IPackageMetadata {
    name: string;
    sdkVersion: string;
    created: Date;
}

export interface IJsonContentType {
    codename: string;
    name: string;
    contentGroups: IJsonContentTypeGroup[];
    elements: IJsonContentTypeElement[];
}

export interface IJsonContentTypeSnippet {
    codename: string;
    name: string;
    elements: IJsonContentTypeElement[];
}

export interface IJsonContentTypeGroup {
    codename: string | undefined;
    name: string;
}

export interface IJsonTaxonomy {
    codename: string;
    name: string;
    terms: IJsonTaxonomyTerm[];
}

export interface IJsonTaxonomyTerm {
    name: string;
    codename: string;
    terms: IJsonTaxonomyTerm[];
}

export interface IJsonContentTypeElement extends ElementContracts.IContentTypeElementContract {}
