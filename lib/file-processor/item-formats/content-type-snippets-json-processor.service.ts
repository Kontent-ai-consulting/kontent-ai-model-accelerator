import { IContentTypeSnippetsFormatService } from '../file-processor.models';
import { ContentTypeModels } from '@kontent-ai/management-sdk';
import { IJsonContentTypeSnippet } from '../../core';

export class ContentTypeSnippetsJsonProcessorService implements IContentTypeSnippetsFormatService {
    public readonly name: string = 'json';
    async transformAsync(types: ContentTypeModels.ContentType[]): Promise<IJsonContentTypeSnippet[]> {
        const mappedTypes: IJsonContentTypeSnippet[] = types.map((m) => {
            const jsonType: IJsonContentTypeSnippet = {
                codename: m.codename,
                name: m.name
            };

            return jsonType;
        });
        return mappedTypes;
    }

    async parseAsync(text: string): Promise<IJsonContentTypeSnippet[]> {
        return [];
    }
}
