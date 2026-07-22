import { describe, expect, it } from 'vitest';
import {
  buildObjectKey,
  extensionFor,
  isAllowedImageType,
  MAX_UPLOAD_BYTES,
} from './upload.js';

describe('upload helpers', () => {
  describe('isAllowedImageType', () => {
    it('accepts the supported raster types', () => {
      expect(isAllowedImageType('image/png')).toBe(true);
      expect(isAllowedImageType('image/jpeg')).toBe(true);
      expect(isAllowedImageType('image/gif')).toBe(true);
      expect(isAllowedImageType('image/webp')).toBe(true);
    });

    it('rejects non-image and svg', () => {
      expect(isAllowedImageType('application/pdf')).toBe(false);
      expect(isAllowedImageType('image/svg+xml')).toBe(false);
      expect(isAllowedImageType('')).toBe(false);
    });
  });

  describe('extensionFor', () => {
    it('maps content types to extensions', () => {
      expect(extensionFor('image/png')).toBe('png');
      expect(extensionFor('image/jpeg')).toBe('jpg');
      expect(extensionFor('image/webp')).toBe('webp');
    });

    it('returns undefined for unsupported types', () => {
      expect(extensionFor('image/svg+xml')).toBeUndefined();
    });
  });

  it('caps uploads at 5 MB', () => {
    expect(MAX_UPLOAD_BYTES).toBe(5 * 1024 * 1024);
  });

  describe('buildObjectKey', () => {
    it('partitions by year/month and ends with a uuid + extension', () => {
      const key = buildObjectKey('png', new Date(Date.UTC(2026, 6, 22)));
      expect(key).toMatch(/^images\/2026\/07\/[0-9a-f-]{36}\.png$/);
    });

    it('zero-pads single-digit months', () => {
      const key = buildObjectKey('webp', new Date(Date.UTC(2026, 0, 5)));
      expect(key.startsWith('images/2026/01/')).toBe(true);
    });

    it('produces unique keys across calls', () => {
      const a = buildObjectKey('png');
      const b = buildObjectKey('png');
      expect(a).not.toBe(b);
    });
  });
});
