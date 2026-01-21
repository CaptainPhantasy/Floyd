# CRUSH Theme: Purple Background Migration Plan

## Problem
DesktopWeb uses GRAY backgrounds while CLI uses RICH PURPLE backgrounds. Need to unify.

## Current DesktopWeb Colors (WRONG - Gray)
```typescript
bg: {
  base: '#201F26',      // Gray ❌
  elevated: '#2d2c35',  // Gray ❌
  overlay: '#3A3943',   // Gray ❌
  modal: '#4D4C57',     // Gray ❌
}
```

## Target CLI Colors (CORRECT - Deep Purple/Black)
```typescript
bg: {
  base: '#0E111A',      // Very deep blue-black (nearly black)
  elevated: '#1C165E',  // Deep purple (sidebar) - nearly black with purple tint
  overlay: '#231991',   // Purple (main content)
  modal: '#4D4C57',     // For modals
}
// Border color (from CLI)
border: '#571362',      // Purple borders for separation
```

**Note**: Backgrounds are "very deep purple, nearly black but not quite"

## Files to Modify

### 1. `FloydDesktopWeb/src/theme/themes.ts` (PRIMARY)
Replace background colors in `CRUSH_COLORS.bg`:
```typescript
base: '#201F26' → '#0E111A'
elevated: '#2d2c35' → '#1C165E'
overlay: '#3A3943' → '#231991'
modal: '#4D4C57' → '#4D4C57' (keep)
```

### 2. `FloydDesktopWeb/tailwind.config.js`
Update CSS variable fallbacks:
```javascript
'crush-base': 'var(--color-bg-base, #0E111A)',
'crush-elevated': 'var(--color-bg-elevated, #1C165E)',
'crush-overlay': 'var(--color-bg-overlay, #231991)',
```

### 3. `FloydDesktopWeb/src/index.css`
Update fallbacks in CSS variables:
- Line 16: `#201F26` → `#0E111A`
- Line 27: `#201F26` → `#0E111A`
- Line 31: `#3A3943` → `#231991`
- Line 36: `#4D4C57` → `#4D4C57`
- Line 41: `#2d2c35` → `#1C165E`
- Line 42: `#3A3943` → `#231991`
- Line 49: `#2d2c35` → `#1C165E`

### 4. `FloydDesktopWeb/src/theme/theme.test.ts` (IMPORTANT!)
Update test expectations:
- Line 36: `'#201F26'` → `'#0E111A'`
- Line 37: `'#2d2c35'` → `'#1C165E'`
- Line 38: `'#3A3943'` → `'#231991'`
- Line 39: `'#4D4C57'` → `'#4D4C57'` (keep)
- Line 184: `'#201F26'` → `'#0E111A'`
- Line 230: `'#201F26'` → `'#0E111A'`

### 5. `FloydDesktopWeb/src/components/SplashScreen.css`
Replace hardcoded colors with CSS variables:
```css
/* Before */
background: linear-gradient(135deg, #6B50FF 0%, #FF60FF 100%);
color: #ffffff;

/* After */
background: linear-gradient(135deg, var(--color-accent-primary, #6B50FF) 0%, var(--color-accent-secondary, #FF60FF) 100%);
color: var(--color-text-inverse, #FFFAF1);
```

## Verification Steps
1. Build: `cd FloydDesktopWeb && npm run build`
2. Run dev: `npm run dev`
3. Open browser to http://localhost:5173
4. Run in browser console:
   ```javascript
   getComputedStyle(document.documentElement).getPropertyValue('--color-bg-base')
   // Should return: '#0E111A'

   document.querySelector('.bg-crush-elevated')
   getComputedStyle(_).backgroundColor
   // Should return: 'rgb(28, 22, 94)' = '#1C165E'
   ```
5. Visual check: Sidebar should be deep purple, main content purple
6. Screenshot comparison with CLI reference image
