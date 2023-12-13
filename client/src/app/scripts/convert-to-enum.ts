// if string is in enum, return string. else, return default
export function convertToEnum(e: { [key: string]: string | number }, str: string | number, defaultString: string | number): string | number {
    if (Object.values(e).includes(str)) {
        return str;
    } else {
        return defaultString;
    }
}