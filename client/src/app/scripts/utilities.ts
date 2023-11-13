export function isNumber(value: any) {
    return typeof value === 'number';
  };

// given number, return with commas
export function numberWithCommas(x: number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}