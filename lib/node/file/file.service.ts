import { promises } from 'fs';
import { logDebug } from '../../core/index.js';

export class FileService {
    constructor() {}

    async loadFileAsync(filename: string): Promise<Buffer> {
        const filePath = this.getFilePath(filename);

        logDebug({
            type: 'ReadFs',
            message: `Reading file`,
            partA: filePath
        });
        const file = await promises.readFile(filePath);

        return file;
    }

    async writeFileAsync(fileNameWithoutExtension: string, content: any): Promise<void> {
        const filePath = this.getFilePath(fileNameWithoutExtension);

        logDebug({
            type: 'WriteFs',
            message: `Writing to file`,
            partA: filePath
        });
        await promises.writeFile(filePath, content);
    }

    private getFilePath(filename: string) {
        return `./${filename}`;
    }
}
