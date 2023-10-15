import { promises } from 'fs';
import { logAction } from '../../core/log-helper';

export class FileService {
    constructor() {}

    async loadFileAsync(filename: string): Promise<Buffer> {
        const filePath = this.getFilePath(filename);

        logAction('readFs', filePath);
        const file = await promises.readFile(filePath);

        return file;
    }

    async writeFileAsync(fileNameWithoutExtension: string, content: any): Promise<void> {
        const filePath = this.getFilePath(fileNameWithoutExtension);

        logAction('writeFs', filePath);
        await promises.writeFile(filePath, content);
    }

    private getFilePath(filename: string) {
        return `./${filename}`;
    }
}
