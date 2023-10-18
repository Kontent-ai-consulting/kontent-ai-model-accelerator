import { IContentTypeFormatService } from '../file-processor.models';
import { ContentTypeElements, ContentTypeModels, ElementContracts } from '@kontent-ai/management-sdk';
import {
    IJsonContentType,
    IJsonContentTypeElement,
    IJsonContentTypeGroup,
} from '../../core';

export class ContentTypesJsonProcessorService implements IContentTypeFormatService {
    public readonly name: string = 'json';

    async transformAsync(types: ContentTypeModels.ContentType[]): Promise<IJsonContentType[]> {
        const mappedTypes: IJsonContentType[] = types.map((contentType) => {
            const jsonType: IJsonContentType = {
                codename: contentType.codename,
                name: contentType.name,
                externalId: contentType.id,
                contentGroups:
                    contentType.contentGroups?.map((contentGroup) => {
                        const jsonContentGroup: IJsonContentTypeGroup = {
                            name: contentGroup.name,
                            external_id: contentGroup.id
                        };

                        return jsonContentGroup;
                    }) ?? [],
                elements: contentType._raw.elements.map((element) => this.getJsonElement(element))
            };

            return jsonType;
        });
        return mappedTypes;
    }

    async parseAsync(text: string): Promise<IJsonContentType[]> {
        return [];
    }

    private getJsonElement(element: ElementContracts.IContentTypeElementContract): IJsonContentTypeElement {
        return element as ContentTypeElements.IElementShared;
    }
}
