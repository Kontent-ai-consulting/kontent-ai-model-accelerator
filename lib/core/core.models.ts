export interface ICliFileConfig {
    environmentId: string;
    apiKey: string;
    action: CliAction;
    baseUrl?: string;
    filename?: string;
}

export type CliAction = 'export' | 'import';

export interface IPackageMetadata {
    version: string;
    created: Date;
}

export interface IJsonContentType {
    codename: string;
    name: string;
}

export interface IJsonContentTypeSnippet {
    codename: string;
    name: string;
}

export interface IJsonTaxonomy {
    codename: string;
    name: string;
}
