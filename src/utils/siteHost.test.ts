import { describe, expect, it } from 'vitest';
import { getSiteHost } from './siteHost';

describe('getSiteHost', () => {
  it('extracts the hostname from a URL', () => {
    expect(getSiteHost('https://dev.to/author/some-post')).toBe('dev.to');
  });

  it('strips a leading www.', () => {
    expect(getSiteHost('https://www.example.com/path')).toBe('example.com');
  });

  it('handles subdomains without stripping them', () => {
    expect(getSiteHost('https://blog.bytebytego.com/')).toBe('blog.bytebytego.com');
  });

  it('returns null for undefined input', () => {
    expect(getSiteHost(undefined)).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(getSiteHost('')).toBeNull();
  });

  it('returns null for an unparseable URL', () => {
    expect(getSiteHost('not a url')).toBeNull();
  });
});
