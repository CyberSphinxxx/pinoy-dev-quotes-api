/**
 * OWNS: Global Constants
 * DO: Add shared magic strings, numbers, and configuration values.
 * DON'T: Add logic or styles here.
 */

export const STORAGE_KEYS = {
  THEME: 'pdq-theme',
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export const API_CONFIG = {
  BASE_URL: import.meta.env.PUBLIC_API_URL || '',
  DEFAULT_LIMIT: 10,
  TICKET_URL: 'https://github.com/CyberSphinxxx/pinoy-dev-quotes-api/issues/new?title=API+Key+Request&body=Please+provide+your+use+case+and+app+name.',
} as const;

export const DIALECTS = [
  'bisaya',
  'tagalog',
  'ilocano',
  'hiligaynon',
  'bikol',
  'waray',
  'kapampangan',
] as const;
