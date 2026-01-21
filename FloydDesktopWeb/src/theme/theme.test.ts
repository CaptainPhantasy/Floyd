/**
 * Smoke Tests for CRUSH Theme System
 * A+ Alignment: Verifies all 81 color tokens are accessible and working
 * (22 core + 36 extended + 9 role + 8 syntax + 6 diff = 81)
 */

import { describe, it, expect } from 'vitest';
import { THEMES, DEFAULT_THEME, getTheme, getColor, hasColor, themeToCssVariables } from './themes';
import type { ThemeId, Theme, ExtendedColors, RoleColors, SyntaxColors, DiffColors } from './types';

describe('CRUSH Theme - Smoke Tests', () => {
  describe('Theme Structure', () => {
    it('should have both crush and light themes', () => {
      expect(THEMES.crush).toBeDefined();
      expect(THEMES.light).toBeDefined();
    });

    it('should have correct theme IDs', () => {
      expect(THEMES.crush.id).toBe('crush');
      expect(THEMES.light.id).toBe('light');
    });

    it('should have correct theme names', () => {
      expect(THEMES.crush.name).toBe('CRUSH');
      expect(THEMES.light.name).toBe('Light');
    });

    it('should have DEFAULT_THEME set to crush', () => {
      expect(DEFAULT_THEME).toBe('crush');
    });
  });

  describe('Core Colors - 23 colors', () => {
    it('should have all background colors (4)', () => {
      const crush = THEMES.crush.colors.bg;
      expect(crush.base).toBe('#0E111A');   // Very deep blue-black (nearly black)
      expect(crush.elevated).toBe('#1C165E'); // Deep purple (sidebar)
      expect(crush.overlay).toBe('#231991');  // Purple (main content)
      expect(crush.modal).toBe('#4D4C57');    // For modals
    });

    it('should have all text colors (6)', () => {
      const crush = THEMES.crush.colors.text;
      expect(crush.primary).toBe('#DFDBDD');   // Ash
      expect(crush.secondary).toBe('#959AA2'); // Squid
      expect(crush.tertiary).toBe('#BFBCC8');  // Smoke
      expect(crush.subtle).toBe('#706F7B');    // Oyster
      expect(crush.selected).toBe('#F1EFEF');  // Salt
      expect(crush.inverse).toBe('#FFFAF1');   // Butter
    });

    it('should have all accent colors (5)', () => {
      const crush = THEMES.crush.colors.accent;
      expect(crush.primary).toBe('#6B50FF');   // Charple
      expect(crush.secondary).toBe('#FF60FF'); // Dolly
      expect(crush.tertiary).toBe('#68FFD6');  // Bok
      expect(crush.highlight).toBe('#E8FE96'); // Zest
      expect(crush.info).toBe('#00A4FF');      // Malibu
    });

    it('should have all status colors (7)', () => {
      const crush = THEMES.crush.colors.status;
      expect(crush.ready).toBe('#12C78F');    // Guac
      expect(crush.working).toBe('#6B50FF');  // Charple
      expect(crush.warning).toBe('#E8FE96');  // Zest
      expect(crush.error).toBe('#EB4268');    // Sriracha
      expect(crush.blocked).toBe('#FF60FF');  // Dolly
      expect(crush.offline).toBe('#858392');  // Squid
      expect(crush.busy).toBe('#E8FF27');     // Citron
    });
  });

  describe('Extended Colors - 31 colors', () => {
    it('should have all red/pink colors (7)', () => {
      const ext = THEMES.crush.colors.extended;
      expect(ext.coral).toBe('#FF577D');
      expect(ext.salmon).toBe('#FF7F90');
      expect(ext.cherry).toBe('#FF3888');
      expect(ext.sriracha).toBe('#EB4268');
      expect(ext.chili).toBe('#E23080');
      expect(ext.bengal).toBe('#FF6E63');
      expect(ext.blush).toBe('#FF84FF');
    });

    it('should have all purple colors (8)', () => {
      const ext = THEMES.crush.colors.extended;
      expect(ext.violet).toBe('#C259FF');
      expect(ext.mauve).toBe('#D46EFF');
      expect(ext.grape).toBe('#7134DD');
      expect(ext.plum).toBe('#9953FF');
      expect(ext.orchid).toBe('#AD6EFF');
      expect(ext.jelly).toBe('#4A30D9');
      expect(ext.hazy).toBe('#8B75FF');
      expect(ext.prince).toBe('#9C35E1');
      expect(ext.urchin).toBe('#C337E0');
    });

    it('should have all blue colors (9)', () => {
      const ext = THEMES.crush.colors.extended;
      expect(ext.malibu).toBe('#00A4FF');
      expect(ext.sardine).toBe('#4FBEFE');
      expect(ext.damson).toBe('#007AB8');
      expect(ext.thunder).toBe('#4776FF');
      expect(ext.anchovy).toBe('#719AFC');
      expect(ext.sapphire).toBe('#4949FF');
      expect(ext.guppy).toBe('#7272FF');
      expect(ext.oceania).toBe('#2B55B3');
      expect(ext.ox).toBe('#3331B2');
    });

    it('should have all green colors (5)', () => {
      const ext = THEMES.crush.colors.extended;
      expect(ext.guac).toBe('#12C78F');
      expect(ext.julep).toBe('#00FFB2');
      expect(ext.pickle).toBe('#00A475');
      expect(ext.gator).toBe('#18463D');
      expect(ext.spinach).toBe('#1C3634');
    });

    it('should have yellow color (1)', () => {
      const ext = THEMES.crush.colors.extended;
      expect(ext.citron).toBe('#E8FF27');
    });

    it('should have all orange/tan colors (5)', () => {
      const ext = THEMES.crush.colors.extended;
      expect(ext.cumin).toBe('#BF976F');
      expect(ext.tang).toBe('#FF985A');
      expect(ext.yam).toBe('#FFB587');
      expect(ext.paprika).toBe('#D36C64');
      expect(ext.uni).toBe('#FF937D');
    });

    it('should have exactly 36 extended colors', () => {
      const ext = THEMES.crush.colors.extended;
      const keys = Object.keys(ext);
      expect(keys.length).toBe(36);
    });
  });

  describe('Role Colors - 9 roles', () => {
    it('should have all role-based colors', () => {
      const roles = THEMES.crush.colors.roles;
      expect(roles.headerTitle).toBe('#FF60FF');      // accent.secondary
      expect(roles.headerStatus).toBe('#DFDBDD');     // text.primary
      expect(roles.userLabel).toBe('#12C78F');       // status.ready
      expect(roles.assistantLabel).toBe('#00A4FF');   // accent.info
      expect(roles.systemLabel).toBe('#E8FE96');     // accent.highlight
      expect(roles.toolLabel).toBe('#68FFD6');       // accent.tertiary
      expect(roles.thinking).toBe('#E8FE96');        // accent.highlight
      expect(roles.inputPrompt).toBe('#12C78F');     // status.ready
      expect(roles.hint).toBe('#959AA2');           // text.secondary
    });
  });

  describe('Syntax Colors - 8 tokens', () => {
    it('should have all syntax colors', () => {
      const syntax = THEMES.crush.colors.syntax;
      expect(syntax.keywords).toBe('#00A4FF');     // accent.info
      expect(syntax.functions).toBe('#12C78F');    // status.ready
      expect(syntax.strings).toBe('#BF976F');      // extended.cumin
      expect(syntax.numbers).toBe('#00FFB2');      // extended.julep
      expect(syntax.comments).toBe('#706F7B');     // text.subtle
      expect(syntax.classes).toBe('#F1EFEF');      // text.selected
      expect(syntax.operators).toBe('#FF6E63');    // extended.bengal
      expect(syntax.punctuation).toBe('#E8FE96');  // accent.highlight
    });
  });

  describe('Diff Colors - 6 tokens', () => {
    it('should have all diff colors', () => {
      const diff = THEMES.crush.colors.diff;
      expect(diff.addition.lineNumber).toBe('#629657');
      expect(diff.addition.symbol).toBe('#629657');
      expect(diff.addition.background).toBe('#323931');
      expect(diff.deletion.lineNumber).toBe('#a45c59');
      expect(diff.deletion.symbol).toBe('#a45c59');
      expect(diff.deletion.background).toBe('#383030');
    });
  });

  describe('Utility Functions', () => {
    it('getColor should retrieve colors by path', () => {
      expect(getColor('bg.base', 'crush')).toBe('#0E111A');
      expect(getColor('status.error', 'crush')).toBe('#EB4268');
      expect(getColor('extended.grape', 'crush')).toBe('#7134DD');
      expect(getColor('roles.userLabel', 'crush')).toBe('#12C78F');
      expect(getColor('syntax.keywords', 'crush')).toBe('#00A4FF');
      expect(getColor('diff.addition.background', 'crush')).toBe('#323931');
    });

    it('getColor should return undefined for invalid paths', () => {
      expect(getColor('invalid.path', 'crush')).toBeUndefined();
      expect(getColor('bg.nonexistent', 'crush')).toBeUndefined();
    });

    it('hasColor should check if color exists in palette', () => {
      expect(hasColor('#0E111A', 'crush')).toBe(true);   // bg.base
      expect(hasColor('#EB4268', 'crush')).toBe(true);   // status.error
      expect(hasColor('#7134DD', 'crush')).toBe(true);   // extended.grape
      expect(hasColor('#12C78F', 'crush')).toBe(true);   // status.ready
      expect(hasColor('#000000', 'crush')).toBe(false);  // not in palette
    });

    it('getTheme should return the correct theme', () => {
      const crush = getTheme('crush');
      expect(crush.id).toBe('crush');
      expect(crush.name).toBe('CRUSH');

      const light = getTheme('light');
      expect(light.id).toBe('light');
      expect(light.name).toBe('Light');
    });
  });

  describe('CSS Variables Generation', () => {
    it('should generate all 81 CSS variables', () => {
      const vars = themeToCssVariables(THEMES.crush);
      const keys = Object.keys(vars);

      // Core colors: 4 bg + 6 text + 5 accent + 7 status = 22
      // Extended: 36
      // Roles: 9
      // Syntax: 8
      // Diff: 6
      // Total: 22 + 36 + 9 + 8 + 6 = 81 CSS variables
      expect(keys.length).toBeGreaterThanOrEqual(81);

      // Check some key variables exist
      expect(vars['--color-bg-base']).toBe('#0E111A');
      expect(vars['--color-accent-primary']).toBe('#6B50FF');
      expect(vars['--color-extended-grape']).toBe('#7134DD');
      expect(vars['--color-role-userLabel']).toBe('#12C78F');
      expect(vars['--color-syntax-keywords']).toBe('#00A4FF');
      expect(vars['--color-diff-addition-background']).toBe('#323931');
    });
  });

  describe('Total Color Count', () => {
    it('should have exactly 81 total color tokens across all categories', () => {
      const crush = THEMES.crush.colors;

      // Count color TOKENS (by name), not unique values
      // Core: 4 bg + 6 text + 5 accent + 7 status = 22
      // Extended: 36
      // Roles: 9
      // Syntax: 8
      // Diff: 6
      // Total: 22 + 36 + 9 + 8 + 6 = 81 color tokens
      let tokenCount = 0;

      // Core colors
      tokenCount += Object.keys(crush.bg).length;
      tokenCount += Object.keys(crush.text).length;
      tokenCount += Object.keys(crush.accent).length;
      tokenCount += Object.keys(crush.status).length;

      // Extended colors
      tokenCount += Object.keys(crush.extended).length;

      // Role colors
      tokenCount += Object.keys(crush.roles).length;

      // Syntax colors
      tokenCount += Object.keys(crush.syntax).length;

      // Diff colors
      tokenCount += Object.keys(crush.diff.addition).length;
      tokenCount += Object.keys(crush.diff.deletion).length;

      expect(tokenCount).toBe(81);
    });
  });
});
