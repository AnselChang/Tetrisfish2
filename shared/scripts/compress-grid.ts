export function compressGridStringToBase64(binaryString: string): string {

    if (binaryString.length !== 200) throw new Error("String length must be 200");

    const buffer = new Uint8Array((binaryString.length + 7) / 8);
    for (let i = 0; i < binaryString.length; i++) {
        if (binaryString[i] === '1') {
            buffer[Math.floor(i / 8)] |= 1 << (7 - i % 8);
        }
    }

    return btoa(String.fromCharCode.apply(null, Array.from(buffer)));
}

export function decompressBase64ToGridString(base64: string): string {
    const binaryStringArray = atob(base64).split('')
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join('');

    return binaryStringArray.slice(0, 200);
}
