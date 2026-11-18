import { describe, it, expect } from 'vitest';
import { generateSRT } from '../lib/export';
import type { Caption } from '../types';

describe('generateSRT', () => {
  it('should generate valid SRT content from captions', () => {
    const captions: Caption[] = [
      { id: '1', start: 0, end: 3.5, text: 'Hello world' },
      { id: '2', start: 4, end: 7.2, text: 'This is a test' },
    ];

    const result = generateSRT(captions);

    expect(result).toContain('1\n00:00:00,000 --> 00:00:03,500\nHello world\n');
    expect(result).toContain('2\n00:00:04,000 --> 00:00:07,200\nThis is a test\n');
  });

  it('should handle empty captions array', () => {
    const result = generateSRT([]);
    expect(result).toBe('');
  });
});
