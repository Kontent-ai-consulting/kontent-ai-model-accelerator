import { ITaxonomiesFormatService } from '../file-processor.models';
import { TaxonomyModels } from '@kontent-ai/management-sdk';
import { IJsonTaxonomy } from '../../core';

export class TaxonomiesJsonProcessorService implements ITaxonomiesFormatService {
    async transformAsync(taxonomies: TaxonomyModels.Taxonomy[]): Promise<IJsonTaxonomy[]> {
        const mappedTaxonomies: IJsonTaxonomy[] = taxonomies.map((taxonomy) => this.mapTaxonomy(taxonomy));
        return mappedTaxonomies;
    }

    private mapTaxonomy(taxonomy: TaxonomyModels.Taxonomy): IJsonTaxonomy {
        return {
            name: taxonomy.name,
            codename: taxonomy.codename,
            externalId: taxonomy.id,
            terms: taxonomy.terms.map((term) => this.mapTaxonomy(term))
        };
    }
}
