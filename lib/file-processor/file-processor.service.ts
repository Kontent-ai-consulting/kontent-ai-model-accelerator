import { IImportSource } from '../import';
import { logAction } from '../core/log-helper';
import { ContentTypesJsonProcessorService } from './item-formats/content-types-json-processor.service';
import { IExportAllResult } from '../export';
import { IJsonContentType, IJsonContentTypeSnippet, IJsonTaxonomy, IPackageMetadata } from '../core';
import { ContentTypeSnippetsJsonProcessorService } from './item-formats/content-type-snippets-json-processor.service';
import { TaxonomiesJsonProcessorService } from './item-formats/taxonomies-json-processor.service';

interface IExportJson {
    metadata: IPackageMetadata;
    contentTypes: IJsonContentType[];
    contentTypeSnippets: IJsonContentTypeSnippet[];
    taxonomies: IJsonTaxonomy[];
}

export class FileProcessorService {
    private readonly contentTypeJsonProcessorService: ContentTypesJsonProcessorService =
        new ContentTypesJsonProcessorService();
    private readonly contentTypeSnippetJsonProcessorService: ContentTypeSnippetsJsonProcessorService =
        new ContentTypesJsonProcessorService();
    private readonly taxonomyJsonProcessorService: TaxonomiesJsonProcessorService =
        new TaxonomiesJsonProcessorService();

    constructor() {}

    async extractJsonFileAsync(file: Buffer): Promise<IImportSource> {
        logAction('info', 'Reading JSON file');

        const result: IImportSource = {
            contentTypes: await this.contentTypeJsonProcessorService.parseAsync(file.toString())
        };

        logAction('info', 'Reading JSON file completed');

        return result;
    }

    async mapExportToJsonAsync(exportData: IExportAllResult): Promise<string> {
        const json: IExportJson = {
            metadata: exportData.metadata,
            contentTypes: await this.contentTypeJsonProcessorService.transformAsync(exportData.data.contentTypes),
            contentTypeSnippets: await this.contentTypeSnippetJsonProcessorService.transformAsync(
                exportData.data.contentTypeSnippets
            ),
            taxonomies: await this.taxonomyJsonProcessorService.transformAsync(exportData.data.taxonomies)
        };

        return JSON.stringify(json);
    }
}
