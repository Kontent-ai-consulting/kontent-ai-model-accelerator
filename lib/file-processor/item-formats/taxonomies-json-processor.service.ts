import { ITaxonomiesFormatService } from '../file-processor.models';
import { TaxonomyModels } from '@kontent-ai/management-sdk';
import { IJsonTaxonomy } from 'lib/core';

export class TaxonomiesJsonProcessorService implements ITaxonomiesFormatService {
    public readonly name: string = 'json';
    async transformAsync(taxonomies: TaxonomyModels.Taxonomy[]): Promise<IJsonTaxonomy[]> {
        const mappedTypes: IJsonTaxonomy[] = taxonomies.map((m) => {
            const jsonType: IJsonTaxonomy = {
                codename: m.codename,
                name: m.name
            };

            return jsonType;
        });
        return mappedTypes;
    }

    async parseAsync(text: string): Promise<IJsonTaxonomy[]> {
        return [];
    }
}
