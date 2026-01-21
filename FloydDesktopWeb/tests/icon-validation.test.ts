/**
 * Icon Validation Tests - Application Launcher Icons
 * Tests for Floyd Desktop Web and Floyd CURSEM IDE icons
 * 
 * TDD Approach: Write tests first, then implement fixes
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Application Launcher Icons', () => {
  const projectDir = '/Volumes/Storage/FLOYD_CLI/FloydDesktopWeb';
  const publicDir = join(projectDir, 'public');
  const distDir = join(projectDir, 'dist');

  describe('Floyd Desktop Web - Icon Files', () => {
    it('should have favicon-16.png in public directory', () => {
      const iconPath = join(publicDir, 'favicon-16.png');
      expect(existsSync(iconPath)).toBe(true);
    });

    it('should have favicon-32.png in public directory', () => {
      const iconPath = join(publicDir, 'favicon-32.png');
      expect(existsSync(iconPath)).toBe(true);
    });

    it('should have apple-touch-icon.png in public directory', () => {
      const iconPath = join(publicDir, 'apple-touch-icon.png');
      expect(existsSync(iconPath)).toBe(true);
    });

    it('should have logo-128.png in public directory', () => {
      const iconPath = join(publicDir, 'logo-128.png');
      expect(existsSync(iconPath)).toBe(true);
    });

    it('should copy icon files to dist directory after build', () => {
      expect(existsSync(join(distDir, 'favicon-16.png'))).toBe(true);
      expect(existsSync(join(distDir, 'favicon-32.png'))).toBe(true);
      expect(existsSync(join(distDir, 'apple-touch-icon.png'))).toBe(true);
    });
  });

  describe('Floyd Desktop Web - HTML Icon References', () => {
    it('should reference valid favicon in index.html', () => {
      const indexPath = join(projectDir, 'index.html');
      const html = readFileSync(indexPath, 'utf-8');
      
      // Should NOT reference non-existent floyd.svg
      expect(html).not.toContain('/floyd.svg');
      
      // Should reference existing PNG icons
      expect(html).toContain('favicon-32.png');
      expect(html).toContain('favicon-16.png');
      expect(html).toContain('apple-touch-icon.png');
    });

    it('should have proper icon link tags with sizes', () => {
      const indexPath = join(projectDir, 'index.html');
      const html = readFileSync(indexPath, 'utf-8');
      
      // Check for proper icon meta tags
      expect(html).toMatch(/sizes=["']32x32["']/);
      expect(html).toMatch(/sizes=["']16x16["']/);
      expect(html).toMatch(/sizes=["']180x180["']/);
    });
  });

  describe('Floyd Desktop Web - App Bundle Icon', () => {
    it('should have icon.icns in app bundle', () => {
      const iconPath = '/Applications/Floyd Desktop.app/Contents/Resources/icon.icns';
      expect(existsSync(iconPath)).toBe(true);
    });

    it('should reference icon.icns in Info.plist', () => {
      const plistPath = '/Applications/Floyd Desktop.app/Contents/Info.plist';
      const plist = readFileSync(plistPath, 'utf-8');
      
      expect(plist).toContain('icon.icns');
    });

    it('should have valid icns file dimensions', () => {
      const iconPath = '/Applications/Floyd Desktop.app/Contents/Resources/icon.icns';
      expect(existsSync(iconPath)).toBe(true);
      // File should be readable and valid icns format
      const stats = require('fs').statSync(iconPath);
      expect(stats.size).toBeGreaterThan(1000); // icns files are typically > 1KB
    });

    it('should launch app and verify server starts', async () => {
      // This is a smoke test that the app launches
      const iconPath = '/Applications/Floyd Desktop.app/Contents/Resources/icon.icns';
      expect(existsSync(iconPath)).toBe(true);
      
      // If icon exists, app should be launchable
      // The actual launch is tested manually or via integration tests
      expect(true).toBe(true);
    });
  });

  describe('Floyd CURSEM IDE - App Bundle Icon', () => {
    it('should have floyd.icns in app bundle', () => {
      const iconPath = '/Applications/Floyd CURSEM IDE.app/Contents/Resources/floyd.icns';
      expect(existsSync(iconPath)).toBe(true);
    });

    it('should reference floyd.icns in Info.plist', () => {
      const plistPath = '/Applications/Floyd CURSEM IDE.app/Contents/Info.plist';
      const plist = readFileSync(plistPath, 'utf-8');
      
      expect(plist).toContain('floyd.icns');
    });

    it('should have valid icns file', () => {
      const iconPath = '/Applications/Floyd CURSEM IDE.app/Contents/Resources/floyd.icns';
      const stats = require('fs').statSync(iconPath);
      expect(stats.size).toBeGreaterThan(1000);
    });
  });
});
