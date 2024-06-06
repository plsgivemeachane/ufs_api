import { formatBytes } from "../utils";

describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(10)).toEqual('10 Bytes');
      expect(formatBytes(1024)).toEqual('1 KiB');
      expect(formatBytes(1024 * 1024)).toEqual('1 MiB');
      expect(formatBytes(1024 * 1024 * 1024)).toEqual('1 GiB');
      expect(formatBytes(1024 * 1024 * 1024 * 1024)).toEqual('1 TiB');
      expect(formatBytes(1024 * 1024 * 1024 * 1024 * 1024)).toEqual('1 PiB');
      expect(formatBytes(1024 * 1024 * 1024 * 1024 * 1024 * 1024)).toEqual('1 EiB');
      expect(formatBytes(1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024)).toEqual('1 ZiB');
      expect(formatBytes(1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024)).toEqual('1 YiB');
    });
  
    it('should format bytes with custom number of decimals', () => {
      expect(formatBytes(1024, 0)).toEqual('1 KiB');
      expect(formatBytes(1024, 3)).toEqual('1 KiB');
      expect(formatBytes(1024 * 1024, 1)).toEqual('1 MiB');
      expect(formatBytes(1024 * 1024, 4)).toEqual('1 MiB');
    });
  
    it('should throw an error if input is not a positive number', () => {
      expect(() => formatBytes(-1)).toThrow('Invalid input. "bytes" must be a positive number.');
      expect(() => formatBytes(NaN)).toThrow('Invalid input. "bytes" must be a positive number.');
      expect(() => formatBytes(Infinity)).toThrow('Invalid input. "bytes" must be a positive number.');
    });
  });