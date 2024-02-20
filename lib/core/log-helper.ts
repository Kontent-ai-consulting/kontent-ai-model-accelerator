import { green, yellow, cyan, Color, red, bgYellow, black, magenta, bgBlack } from 'colors';

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
    let typeColor: Color = green;
    const typeBgColor: Color = bgBlack;

    if (data.type === 'Error') {
        typeColor = red;
    } else if (data.type === 'Info') {
        typeColor = cyan;
    } else if (data.type === 'Import') {
        typeColor = yellow;
    } else if (data.type === 'Skip') {
        typeColor = magenta;
    } else if (data.type === 'Export') {
        typeColor = yellow;
    } else if (data.type === 'Warning') {
        typeColor = red;
    }

    if (data.type === 'Error') {
        data.message = `${data.message} | To see full error run CLI with --debug=true`;
    }

    console.log(
        `${data.type ? `[${typeBgColor(typeColor(data.type))}]` : ''}${data.partA ? `[${yellow(data.partA)}]` : ''}${
            data.partB ? `[${cyan(data.partB)}]` : ''
        }${data.performance ? `[${bgYellow(black(data.performance))}]` : ''}: ${data.message}`
    );
}
