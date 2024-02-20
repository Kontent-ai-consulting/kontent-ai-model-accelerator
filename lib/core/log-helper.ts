import colors, { Color } from 'colors';

export type LogType =
    | 'Error'
    | 'Warning'
    | 'Info'
    | 'Fetch'
    | 'ReadFs'
    | 'WriteFs'
    | 'Export'
    | 'Import'
    | 'Skip'
    | 'Model'
    | 'Complete'
    | null;

export function logDebug(data: {
    type: LogType;
    message: string;
    partA?: string;
    partB?: string;
    performance?: string;
}): void {
    let typeColor: Color = colors.green;
    const typeBgColor: Color = colors.bgBlack;

    if (data.type === 'Error') {
        typeColor = colors.red;
    } else if (data.type === 'Info') {
        typeColor = colors.cyan;
    } else if (data.type === 'Import') {
        typeColor = colors.yellow;
    } else if (data.type === 'Skip') {
        typeColor = colors.magenta;
    } else if (data.type === 'Export') {
        typeColor = colors.yellow;
    } else if (data.type === 'Warning') {
        typeColor = colors.red;
    }

    if (data.type === 'Error') {
        data.message = `${data.message} | To see full error run CLI with --debug=true`;
    }

    console.log(
        `${data.type ? `[${typeBgColor(typeColor(data.type))}]` : ''}${data.partA ? `[${colors.yellow(data.partA)}]` : ''}${
            data.partB ? `[${colors.cyan(data.partB)}]` : ''
        }${data.performance ? `[${colors.bgYellow(colors.black(data.performance))}]` : ''}: ${data.message}`
    );
}
