import { IContentTypeFormatService } from '../file-processor.models.js';
import { ContentTypeElements, ContentTypeModels, ElementContracts } from '@kontent-ai/management-sdk';
import { IJsonContentType, IJsonContentTypeElement, IJsonContentTypeGroup } from '../../core/index.js';

export class ContentTypesJsonProcessorService implements IContentTypeFormatService {
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

    private getJsonElement(element: ElementContracts.IContentTypeElementContract): IJsonContentTypeElement {
        return element as ContentTypeElements.IElementShared;
    }
}
