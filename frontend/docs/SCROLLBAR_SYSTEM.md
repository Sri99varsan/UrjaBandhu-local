# Custom Scrollbar System

Our application uses a custom scrollbar system that matches the green energy theme perfectly. The default browser scrollbars have been replaced with beautiful, themed variants.

## Available Scrollbar Classes

### `.sidebar-scroll`
- **Width**: 8px (easy to grab)
- **Style**: Prominent green gradient with glow effects
- **Use case**: Navigation sidebars, main navigation areas
- **Features**: Border, shadow, smooth hover animations

```tsx
<div className="overflow-y-auto sidebar-scroll">
  {/* Navigation content */}
</div>
```

### `.content-scroll`
- **Width**: 6px (subtle but visible)
- **Style**: Lighter green gradient, less prominent
- **Use case**: Content areas, text containers, card content
- **Features**: Clean, consistent with design system

```tsx
<div className="overflow-y-auto content-scroll">
  {/* Content that needs scrolling */}
</div>
```

### `.modal-scroll`
- **Width**: 4px (minimal footprint)
- **Style**: Clean, simple green theming
- **Use case**: Dropdowns, modals, small UI elements
- **Features**: Unobtrusive, consistent theme

```tsx
<div className="overflow-y-auto modal-scroll">
  {/* Modal or dropdown content */}
</div>
```

### `.scroll-hidden`
- **Width**: Hidden (no visual scrollbar)
- **Style**: Completely invisible
- **Use case**: When you need scrolling functionality but want to hide the scrollbar
- **Features**: Maintains functionality, clean appearance

```tsx
<div className="overflow-y-auto scroll-hidden">
  {/* Content with hidden scrollbar */}
</div>
```

## Automatic Application

Some components automatically use custom scrollbars:

- **AuthenticatedSidebar**: Uses `.sidebar-scroll` by default
- **ScrollArea component**: Uses themed styling automatically
- **Mobile sidebar**: Uses `.sidebar-scroll` for consistency

## Browser Support

- **Webkit browsers** (Chrome, Safari, Edge): Full support with all visual effects
- **Firefox**: Supported via `scrollbar-width` and `scrollbar-color` properties
- **Fallback**: Default browser scrollbars in unsupported browsers

## Theme Colors

All scrollbars use the consistent green energy theme:
- **Primary**: `rgba(34, 197, 94, ...)` (green-500)
- **Secondary**: `rgba(16, 185, 129, ...)` (emerald-500)
- **Hover effects**: Enhanced opacity and glow
- **Track**: Semi-transparent with subtle borders

## Test Page

Visit `/scrollbar-test` to see all scrollbar variants in action and compare their styling.
