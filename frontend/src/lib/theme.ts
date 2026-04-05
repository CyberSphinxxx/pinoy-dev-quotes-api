/**
 * OWNS: Theme Management Logic
 * DO: Handle initialization, toggling, and persistence of the theme.
 * DON'T: Add UI or styles here. Use data-theme on <html>.
 */

import { STORAGE_KEYS, THEMES } from './constants';

export class ThemeManager {
  private static STORAGE_KEY = STORAGE_KEYS.THEME;

  /**
   * Initializes the theme on page load.
   * Should be called as early as possible to prevent FOUC.
   */
  public static init(): void {
    if (typeof window === 'undefined') return;

    const theme = this.getCurrent();
    this.apply(theme);

    // Listen for system theme changes if no preference is saved
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.apply(e.matches ? THEMES.DARK : THEMES.LIGHT);
      }
    });
  }

  /**
   * Toggles between light and dark themes.
   */
  public static toggle(): void {
    const current = this.getCurrent();
    const next = current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    this.apply(next);
    localStorage.setItem(this.STORAGE_KEY, next);
  }

  /**
   * Gets the current theme from storage or system settings.
   */
  public static getCurrent(): string {
    if (typeof window === 'undefined') return THEMES.DARK;

    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved === THEMES.LIGHT || saved === THEMES.DARK) return saved;

    return window.matchMedia('(prefers-color-scheme: light)').matches 
      ? THEMES.LIGHT 
      : THEMES.DARK;
  }

  /**
   * Applies the theme to the <html> element.
   */
  private static apply(theme: string): void {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    // Maintain .dark class for compatibility with existing tailwind/css patterns
    if (theme === THEMES.DARK) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}
