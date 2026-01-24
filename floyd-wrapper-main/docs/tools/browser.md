# Browser Automation API

Complete API reference for Playwright-based browser automation.

## Prerequisites

Browser automation requires **Playwright** to be installed:

```bash
npx playwright install
```

---

## Tools Overview

- [browser_status](#browser_status) - Check browser status
- [browser_navigate](#browser_navigate) - Navigate to URLs
- [browser_read_page](#browser_read_page) - Extract page content
- [browser_screenshot](#browser_screenshot) - Capture screenshots
- [browser_click](#browser_click) - Click elements
- [browser_type](#browser_type) - Type text into inputs
- [browser_find](#browser_find) - Find elements
- [browser_get_tabs](#browser_get_tabs) - List tabs
- [browser_create_tab](#browser_create_tab) - Create new tabs

---

## browser_status

Check if browser is running and get status information.

### Input Schema

```typescript
{}  // No input required
```

### Response

```typescript
{
  success: true,
  data: {
    running: boolean;
    browser_type?: string;  // 'chromium' | 'firefox' | 'webkit'
    tabs: number;
    current_url?: string;
  }
}
```

### Example

```typescript
const status = await browserStatusTool.execute();

if (status.data.running) {
  console.log('Browser is running with', status.data.tabs, 'tabs');
} else {
  console.log('Browser is not running');
}
```

---

## browser_navigate

Navigate to a URL with optional wait conditions.

### Input Schema

```typescript
{
  url: string;             // Required: URL to navigate to
  wait_until?: 'load' | 'domcontentloaded' | 'networkidle';  // Optional (default: 'load')
  timeout?: number;        // Optional: Timeout in milliseconds (default: 30000)
}
```

### Response

```typescript
{
  success: true,
  data: {
    url: string;
    title: string;
    loaded: boolean;
  }
}
```

### Example

```typescript
// Navigate and wait for full load
await browserNavigateTool.execute({
  url: 'https://example.com',
  wait_until: 'load'
});

// Navigate and wait for network idle
await browserNavigateTool.execute({
  url: 'https://example.com',
  wait_until: 'networkidle'
});
```

---

## browser_read_page

Extract page content as markdown or text.

### Input Schema

```typescript
{
  format?: 'markdown' | 'text' | 'html';  // Optional (default: 'markdown')
  selector?: string;      // Optional: CSS selector for specific element
}
```

### Response

```typescript
{
  success: true,
  data: {
    url: string;
    title: string;
    content: string;      // Formatted content
    format: string;
  }
}
```

### Example

```typescript
// Read entire page as markdown
const page1 = await browserReadPageTool.execute({
  format: 'markdown'
});

// Read specific element
const page2 = await browserReadPageTool.execute({
  selector: 'main article',
  format: 'text'
});
```

---

## browser_screenshot

Capture screenshots with various options.

### Input Schema

```typescript
{
  path?: string;          // Optional: Save path (default: auto-generated)
  full_page?: boolean;    // Optional: Capture full page (default: false)
  type?: 'png' | 'jpeg';  // Optional: Image format (default: 'png')
  quality?: number;       // Optional: JPEG quality 0-100 (default: 80)
}
```

### Response

```typescript
{
  success: true,
  data: {
    path: string;
    size: number;         // File size in bytes
    dimensions: {
      width: number;
      height: number;
    }
  }
}
```

### Example

```typescript
// Capture viewport
const shot1 = await browserScreenshotTool.execute({
  path: '/path/to/screenshot.png'
});

// Capture full page
const shot2 = await browserScreenshotTool.execute({
  path: '/path/to/full-page.png',
  full_page: true
});
```

---

## browser_click

Click elements by CSS selector.

### Input Schema

```typescript
{
  selector: string;       // Required: CSS selector
  wait_before?: number;   // Optional: Milliseconds to wait before clicking
  wait_after?: number;    // Optional: Milliseconds to wait after clicking
}
```

### Response

```typescript
{
  success: true,
  data: {
    clicked: boolean;
    selector: string;
  }
}
```

### Example

```typescript
await browserClickTool.execute({
  selector: 'button.submit',
  wait_before: 500,
  wait_after: 1000
});
```

---

## browser_type

Type text into input fields.

### Input Schema

```typescript
{
  selector: string;       // Required: CSS selector for input
  text: string;           // Required: Text to type
  clear?: boolean;        // Optional: Clear field first (default: true)
  delay?: number;         // Optional: Delay between keystrokes (ms)
}
```

### Response

```typescript
{
  success: true,
  data: {
    typed: boolean;
    selector: string;
    text_length: number;
  }
}
```

### Example

```typescript
await browserTypeTool.execute({
  selector: 'input[name="username"]',
  text: 'john_doe',
  clear: true
});
```

---

## browser_find

Find elements on the page.

### Input Schema

```typescript
{
  selector: string;       // Required: CSS selector
  wait?: boolean;         // Optional: Wait for element (default: true)
  timeout?: number;       // Optional: Timeout in milliseconds (default: 5000)
}
```

### Response

```typescript
{
  success: true,
  data: {
    found: boolean;
    count: number;
    elements: ElementInfo[];
  }
}

interface ElementInfo {
  tag: string;
  text: string;
  visible: boolean;
  attributes: Record<string, string>;
}
```

### Example

```typescript
const result = await browserFindTool.execute({
  selector: 'a.btn-primary'
});

console.log(`Found ${result.data.count} buttons`);
```

---

## browser_get_tabs

List all open browser tabs.

### Input Schema

```typescript
{}  // No input required
```

### Response

```typescript
{
  success: true,
  data: {
    tabs: TabInfo[];
    current_tab: number;
  }
}

interface TabInfo {
  index: number;
  url: string;
  title: string;
}
```

### Example

```typescript
const tabs = await browserGetTabsTool.execute();

tabs.data.tabs.forEach(tab => {
  console.log(`${tab.index}: ${tab.title} - ${tab.url}`);
});
```

---

## browser_create_tab

Open new browser tabs.

### Input Schema

```typescript
{
  url?: string;           // Optional: URL to navigate to
}
```

### Response

```typescript
{
  success: true,
  data: {
    tab_index: number;
    url?: string;
  }
}
```

### Example

```typescript
// Open blank tab
const tab1 = await browserCreateTabTool.execute({});

// Open tab with URL
const tab2 = await browserCreateTabTool.execute({
  url: 'https://example.com'
});
```

---

## Common Selectors

### Navigation

```typescript
'a.nav-link'              // Navigation links
'button.submit'           // Submit buttons
'input[type="text"]'      // Text inputs
'textarea'                // Text areas
```

### Forms

```typescript
'form#login'              // Login form
'input[name="email"]'     // Email field
'input[type="password"]'  // Password field
'button[type="submit"]'   // Submit button
```

### Content

```typescript
'article'                // Articles
'h1, h2, h3'             // Headings
'.content'               // Content div
'#main'                  // Main section
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `BROWSER_NOT_RUNNING` | Browser is not running |
| `NAVIGATION_FAILED` | Failed to navigate to URL |
| `ELEMENT_NOT_FOUND` | Element not found |
| `CLICK_FAILED` | Failed to click element |
| `TYPE_FAILED` | Failed to type text |
| `SCREENSHOT_FAILED` | Failed to capture screenshot |

---

## Best Practices

1. **Wait for elements** before interacting
2. **Use specific selectors** to avoid ambiguity
3. **Handle errors** gracefully
4. **Close browser** when done (automatic cleanup)
5. **Use timeouts** to prevent hanging

---

**Category:** browser
**Tools:** 9
**Permission Level:** supervisor
