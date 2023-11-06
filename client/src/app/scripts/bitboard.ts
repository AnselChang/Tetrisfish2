// A 16x16 bitboard

function bitCount(n: bigint): number {
    let bits = 0;
    while (n !== BigInt(0)) {
      // Call bitCount32 with the low 32 bits of n
      bits += bitCount32(Number(n & BigInt(0xFFFFFFFF)));
      // Shift n right by 32 bits
      n >>= BigInt(32);
    }
    return bits;
}
  
function bitCount32(n: number): number {
    // These operations are intended for 32-bit integers.
    // No changes needed from the original JavaScript, except ensuring >>> is used for unsigned right shift.
    n = n - ((n >>> 1) & 0x55555555);
    n = (n & 0x33333333) + ((n >>> 2) & 0x33333333);
    return (((n + (n >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24;
}

export class Bitboard {
    constructor(public board: bigint) {}

    static xor(a: Bitboard, b: Bitboard): Bitboard {
        return new Bitboard(a.board ^ b.board);
    }

    popcount(): number {
        return bitCount(this.board);
    }

    print() {
        const size = 16;
        let output = '';
      
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            // Calculate the bit position
            const bitPosition = BigInt(y * size + x);
            // Determine if the bit at the bitPosition is set
            const isSet = (this.board & (1n << bitPosition)) !== 0n;
            // Append the appropriate character to the output string
            output += isSet ? '#' : '.';
          }
          // Add a newline character after each row
          output += '\n';
        }
      
        console.log(output);
      }

}