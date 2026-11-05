declare module 'utif' {
  interface TiffImage {
    t256?: number[];
    t257?: number[];
    t262?: number[];
    width?: number;
    height?: number;
  }
  const UTIF: {
    decode(buffer: ArrayBuffer): TiffImage[];
    decodeImage(buffer: ArrayBuffer, image: TiffImage): void;
    toRGBA8(image: TiffImage): Uint8Array;
  };
  export default UTIF;
}
