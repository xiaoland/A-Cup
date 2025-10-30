# UI Components Documentation

## Navigation Bar

The navigation bar (`NavigationBar.vue`) provides consistent navigation across the application.

### Features
- **Brand Logo**: Displays "A-Cup" with cloud icon
- **Main Menu Items**: 
  - Home
  - Profiles
  - Outbounds
  - Rule Sets
- **User Section**: Avatar icon and logout button
- **Sticky Position**: Remains at top of viewport during scroll
- **Responsive**: Adapts to mobile and desktop layouts

### Usage
```vue
<NavigationBar />
```

The navigation bar is automatically included in `App.vue` for all authenticated routes and hidden on the login page.

### Styling
- Uses PrimeVue Menubar component
- Sticky positioning with z-index 1000
- Background adapts to theme (light/dark mode)

## Home Page

The home page (`Home.vue`) serves as the dashboard and landing page after login.

### Features

#### Welcome Section
- Large heading with welcome message
- Descriptive subtitle

#### Stats Overview Cards
Three interactive cards displaying:
1. **Profiles Card**
   - Total count of profiles
   - Blue theme (#3b82f6)
   - Quick navigation to profiles list

2. **Outbounds Card**
   - Total count of outbound configurations
   - Green theme (#10b981)
   - Quick navigation to outbounds list

3. **Rule Sets Card**
   - Total count of rule sets
   - Orange theme (#f59e0b)
   - Quick navigation to rule sets list

Each card includes:
- Color-coded icon
- Total count display
- Description text
- Action button for navigation
- Hover effect (lift and shadow)

#### Quick Start Guide
Step-by-step guide for new users:
1. **Create Outbounds** - Set up proxy servers
2. **Configure Rule Sets** - Define routing rules
3. **Build Profiles** - Combine components
4. **Deploy & Share** - Export or host profiles

### Layout
- Maximum width: 1200px (centered)
- Responsive grid: 1 column (mobile) → 3 columns (desktop)
- Consistent padding and spacing

### Data Loading
The home page fetches statistics from the API on mount:
- `/api/profiles` - Profile count
- `/api/outbounds` - Outbound count
- `/api/rulesets` - Rule set count

Errors are logged to console without blocking the UI.

## App Layout Structure

### App.vue
The root component provides the main layout structure:

```vue
<template>
  <div id="app">
    <NavigationBar v-if="showNavigation" />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>
```

### Layout Features
- **Conditional Navigation**: Navigation bar hidden on login page
- **Flex Layout**: Full viewport height with flexible content area
- **Main Content Area**: Padding and flex growth for page content
- **Theme Variables**: Uses PrimeVue theme system (--surface-ground)

### Styling Conventions
- Global body styles in `App.vue`
- Component-specific styles are scoped
- Consistent container classes:
  - `p-4 md:p-6` - Responsive padding
  - `max-width: 1200px` or `1400px` - Centered content
  - `margin: 0 auto` - Center alignment

## PrimeVue Components Used

### Navigation
- **Menubar**: Main navigation component
- **Avatar**: User icon display
- **Button**: Logout and action buttons

### Home Page
- **Card**: Content containers with header/content/footer slots
- **Button**: Navigation and action triggers

### Common Patterns
- **Icons**: PrimeIcons (`pi pi-*`)
- **Severity**: `primary`, `secondary`, `success`, `info`, `danger`, `warning`
- **Text Variants**: `text` prop for text-only buttons
- **Responsive Layout**: UnoCSS utilities (`grid`, `flex`, `md:*`)

## Theme Support

The application supports PrimeVue Aura theme with automatic dark mode:
- CSS variables for colors (`--primary`, `--surface-ground`)
- Dark mode classes automatically applied
- Text colors adapt (`text-gray-600 dark:text-gray-400`)

## Responsive Design

### Breakpoints (UnoCSS)
- Mobile: < 768px
- Desktop: ≥ 768px (md:)

### Patterns
```vue
<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">

<!-- Responsive padding -->
<div class="p-4 md:p-6">

<!-- Responsive text -->
<h1 class="text-2xl md:text-4xl">
```

## Best Practices

1. **Scoped Styles**: Use `<style scoped>` for component-specific CSS
2. **Composition API**: Prefer `<script setup>` syntax
3. **Type Safety**: Import and use TypeScript types
4. **Error Handling**: Use try-catch with user-friendly messages
5. **Loading States**: Show loading indicators for async operations
6. **Accessibility**: Include proper ARIA labels and semantic HTML
7. **Consistent Spacing**: Use UnoCSS utilities for margins/padding
8. **Container Wrapping**: Wrap page content in container divs with max-width

## Future Enhancements

Potential improvements:
- Add user profile dropdown menu
- Implement theme switcher (light/dark toggle)
- Add notification center
- Include search functionality
- Show recent activity on home page
- Add quick create buttons for common actions
- Display system status indicators