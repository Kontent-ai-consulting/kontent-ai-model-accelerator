import colors from 'colors';

export type Log = (data: {
    type: LogType;
    message: string;
    count?: {
        index: number;
        total: number;
    };
}) => void;

export type LogType =
    | 'Error'
    | 'Warning'
    | 'Info'
    | 'Fetch'
    | 'ReadFs'
    | 'WriteFs'
    | 'Export'
    | 'Import'
    | 'Cancel'
    | 'Content Types'
    | 'Skip'
    | 'Taxonomies'
    | 'Snippets'
    | 'Model'
    | 'Completed';

export function logErrorAndExit(data: { message: string }): never {
    console.log(`${colors.red('Error: ')} ${data.message}`);
    exitProcess();
}

export function exitProcess(): never {
    process.exit(1);
}

export async function withDefaultLogAsync(func: (log: Log) => Promise<void>): Promise<void> {
    const log = getDefaultLog();
    await func(log);
}

function getDefaultLog(): Log {
    return (data) => {
        let typeColor = colors.yellow;

        if (data.type === 'Info') {
            typeColor = colors.cyan;
        } else if (data.type === 'Error' || data.type === 'Warning' || data.type === 'Cancel') {
            typeColor = colors.red;
        } else if (data.type === 'Completed') {
            typeColor = colors.green;
        } else if (data.type === 'Skip') {
            typeColor = colors.gray;
        }

        const message = `${typeColor(data.type)}: ${data.message}`;
        console.log(message);
    };
}
