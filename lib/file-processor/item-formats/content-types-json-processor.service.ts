import { IContentTypeFormatService } from '../file-processor.models';
import { ContentTypeModels } from '@kontent-ai/management-sdk';
import { IJsonContentType } from 'lib/core';

export class ContentTypesJsonProcessorService implements IContentTypeFormatService {
    public readonly name: string = 'json';
    async transformAsync(types: ContentTypeModels.ContentType[]): Promise<IJsonContentType[]> {
        const mappedTypes: IJsonContentType[] = types.map((m) => {
            const jsonType: IJsonContentType = {
                codename: m.codename,
                name: m.name
            };

            return jsonType;
        });
        return mappedTypes;
    }

    async parseAsync(text: string): Promise<IJsonContentType[]> {
        return [];
    }
}
