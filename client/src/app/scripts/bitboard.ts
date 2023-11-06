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

    // tuned from Ansel's mac emulator with 70% threshold
    public static readonly DIGITS: { [key: number]: Bitboard } = {
        0 : new Bitboard(3590288021214776714476437278473329727004422419380605736450026564901563008992n),
        1 : new Bitboard(7587739801549080339139277604074719084681555661259881840442696961926058093225967616n),
        2 : new Bitboard(7588550358493304176682531560170282090648049799675364637800638526194380118418784256n),
        3 : new Bitboard(1896240188066853837513746247146934561640262343466051345676498013652271036982886400n),
        4 : new Bitboard(1837880083978353736144431481546830934730157146203676724041628028040639074625650688n),
        5 : new Bitboard(1896703363491218321355654513814720664267868085884580052589546449320696988689104896n),
        6 : new Bitboard(1896703363491218321355654516761572402894675928632421560751396530487610425695272960n),
        7 : new Bitboard(114867505248646897881229653254923056140565947149791351036168465703784851070386176n),
        8 : new Bitboard(1896240188066853837513746250116226516694838738341704079285289291862116513827258368n),
        9 : new Bitboard(236682642029726767590448924777808822040450224474052581725431240382384997205016576n),
    }

    constructor(public board: bigint) {}

    static getDigit(digit: number): Bitboard {
        return Bitboard.DIGITS[digit];
    }

    // return the digit most similar to the given bitboard, and a confidence from 0 to 1
    // XOR with each digit mask and count the number of bits that are different
    static classify(unknown: Bitboard): [number, number] {
            
        let bestDigit = 0;
        let bestConfidence = 0;

        for (let digit = 0; digit < 10; digit++) {
            const xor = Bitboard.xor(unknown, Bitboard.getDigit(digit));
            const popcount = xor.popcount();
            const confidence = 1 - (popcount / 256);
            if (confidence > bestConfidence) {
                bestDigit = digit;
                bestConfidence = confidence;
            }
        }

        return [bestDigit, bestConfidence];
    }

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
        
        console.log(this.board);
        console.log(output);
      }
}