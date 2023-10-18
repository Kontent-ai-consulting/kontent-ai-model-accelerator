import { ContentTypesJsonProcessorService } from './item-formats/content-types-json-processor.service';
import { IExportAllResult, IExportJson } from '../export';
import { idTranslateHelper } from '../core';
import { ContentTypeSnippetsJsonProcessorService } from './item-formats/content-type-snippets-json-processor.service';
import { TaxonomiesJsonProcessorService } from './item-formats/taxonomies-json-processor.service';

export class FileProcessorService {
    private readonly contentTypeJsonProcessorService: ContentTypesJsonProcessorService =
        new ContentTypesJsonProcessorService();
    private readonly contentTypeSnippetJsonProcessorService: ContentTypeSnippetsJsonProcessorService =
        new ContentTypeSnippetsJsonProcessorService();
    private readonly taxonomyJsonProcessorService: TaxonomiesJsonProcessorService =
        new TaxonomiesJsonProcessorService();

    constructor() {}

    async extractJsonFileAsync(file: Buffer): Promise<IExportJson> {
        const exportJson: IExportJson = JSON.parse(file.toString());
        return exportJson;
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

        // replace id references with codenames
        idTranslateHelper.replaceIdReferences(json, exportData, {});

        // clean unnecessary props
        idTranslateHelper.cleanUnnecessaryProperties(json);

        return JSON.stringify(json);
    }
}
