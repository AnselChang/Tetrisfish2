const EMPTY_SHORTHAND = "AAAAA"; // replaced with EMPTY_SHORTHAND_CHAR
const EMPTY_SHORTHAND_CHAR = "*";

export function compressGridStringToBase64(binaryString: string): string {

    if (binaryString.length !== 200) throw new Error("String length must be 200");

    const buffer = new Uint8Array((binaryString.length + 7) / 8);
    for (let i = 0; i < binaryString.length; i++) {
        if (binaryString[i] === '1') {
            buffer[Math.floor(i / 8)] |= 1 << (7 - i % 8);
        }
    }

    const base64 = btoa(String.fromCharCode.apply(null, Array.from(buffer)));
    
    // one more compression step: replace substrings of (EMPTY_SHORTHAND) with (EMPTY_SHORTHAND_CHAR)

    let result = "";
    let i = 0;
    while (i < base64.length) {
        if (base64.slice(i, i+EMPTY_SHORTHAND.length) === EMPTY_SHORTHAND) {
            result += EMPTY_SHORTHAND_CHAR;
            i += EMPTY_SHORTHAND.length;
        } else {
            result += base64[i];
            i++;
        }
    }

    return result;

}

export function decompressBase64ToGridString(base64: string): string {

    // one more decompression step: replace (EMPTY_SHORTHAND_CHAR) with (EMPTY_SHORTHAND)
    let result = "";
    for (let i = 0; i < base64.length; i++) {
        if (base64[i] === EMPTY_SHORTHAND_CHAR) {
            result += EMPTY_SHORTHAND;
        } else {
            result += base64[i];
        }
    }

    const binaryStringArray = atob(result).split('')
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join('');

    return binaryStringArray.slice(0, 200);
}
