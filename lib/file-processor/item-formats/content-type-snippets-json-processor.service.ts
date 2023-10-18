import { IContentTypeSnippetsFormatService } from '../file-processor.models';
import { ContentTypeElements, ContentTypeSnippetModels, ElementContracts } from '@kontent-ai/management-sdk';
import { IJsonContentTypeElement, IJsonContentTypeSnippet } from '../../core';

export class ContentTypeSnippetsJsonProcessorService implements IContentTypeSnippetsFormatService {
    public readonly name: string = 'json';
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

    async parseAsync(text: string): Promise<IJsonContentTypeSnippet[]> {
        return [];
    }

    private getJsonElement(element: ElementContracts.IContentTypeElementContract): IJsonContentTypeElement {
        return element as ContentTypeElements.IElementShared;
    }
}
