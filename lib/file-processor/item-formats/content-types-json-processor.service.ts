import { IContentTypeFormatService } from '../file-processor.models';
import { ContentTypeModels, ElementContracts } from '@kontent-ai/management-sdk';
import { IJsonContentType, IJsonContentTypeElement, IJsonContentTypeGroup } from 'lib/core';

export class ContentTypesJsonProcessorService implements IContentTypeFormatService {
    public readonly name: string = 'json';

    async transformAsync(types: ContentTypeModels.ContentType[]): Promise<IJsonContentType[]> {
        const mappedTypes: IJsonContentType[] = types.map((contentType) => {
            const jsonType: IJsonContentType = {
                codename: contentType.codename,
                name: contentType.name,
                contentGroups:
                    contentType.contentGroups?.map((contentGroup) => {
                        const jsonContentGroup: IJsonContentTypeGroup = {
                            codename: contentGroup.codename,
                            name: contentGroup.name
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
        return element;
    }
}
