declare module "music-tempo" {
  export default class MusicTempo {
    tempo: number;        // kiszámolt BPM
    beats: number[];      // beatek időpontjai másodpercben
    constructor(
      audioData: Float32Array | number[],
      options?: {
        expiryTime?: number;
        maxBeatInterval?: number;
        minBeatInterval?: number;
      }
    );
  }
}
