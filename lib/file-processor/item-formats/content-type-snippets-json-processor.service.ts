import { IContentTypeSnippetsFormatService } from '../file-processor.models.js';
import { ContentTypeSnippetModels, ElementContracts } from '@kontent-ai/management-sdk';
import { JsonContentTypeElement, IJsonContentTypeSnippet } from '../../core/index.js';

export class ContentTypeSnippetsJsonProcessorService implements IContentTypeSnippetsFormatService {
    async transformAsync(types: ContentTypeSnippetModels.ContentTypeSnippet[]): Promise<IJsonContentTypeSnippet[]> {
        const mappedSnippets: IJsonContentTypeSnippet[] = types.map((contentTypeSnippet) => {
            const jsonType: IJsonContentTypeSnippet = {
                codename: contentTypeSnippet.codename,
                name: contentTypeSnippet.name,
                externalId: contentTypeSnippet.id,
                elements: contentTypeSnippet._raw.elements.map((element) => this.getJsonElement(element))
            };

            return jsonType;
        });
        return mappedSnippets;
    }

    private getJsonElement(element: ElementContracts.IContentTypeElementContract): JsonContentTypeElement {
        return element as JsonContentTypeElement;
    }
}
