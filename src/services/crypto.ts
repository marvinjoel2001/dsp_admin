import CryptoJS from 'crypto-js';

export class CryptoHelper {
  static computeHmacSha256(payload: string | object, secret: string): string {
    const stringified = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return CryptoJS.HmacSHA256(stringified, secret).toString(CryptoJS.enc.Hex);
  }

  static verifySignature(payload: string | object, secret: string, signature: string): boolean {
    const computed = this.computeHmacSha256(payload, secret);
    return computed.toLowerCase() === signature.toLowerCase();
  }
}
