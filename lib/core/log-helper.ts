import { green, yellow, cyan, Color, red, bgYellow, black, magenta, bgBlack, blue } from 'colors';

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
    | 'List'
    | 'Complete';

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
        typeColor = blue;
    } else if (data.type === 'Import') {
        typeColor = cyan;
    } else if (data.type === 'Skip') {
        typeColor = magenta;
    } else if (data.type === 'Export') {
        typeColor = yellow;
    } else if (data.type === 'Warning') {
        typeColor = red;
    }

    console.log(
        `[${typeBgColor(typeColor(data.type))}]${data.partA ? `[${yellow(data.partA)}]` : ''}${
            data.partB ? `[${cyan(data.partB)}]` : ''
        }${data.performance ? `[${bgYellow(black(data.performance))}]` : ''}: ${data.message}`
    );
}
