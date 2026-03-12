---
nav:
  title: Accessibility Checklist
  position: 31
---

# Storefront Accessibility

Creating an accessible storefront ensures that all users can navigate, interact with, and benefit from your site. Accessibility is not only a best practice but a legal and ethical responsibility that contributes to a more inclusive web.

This checklist outlines the key principles and technical requirements for building accessible web interfaces, with a focus on semantic structure, keyboard usability, screen reader compatibility, and inclusive design practices.

## Storefront accessibility checklist: Best practices for inclusive web design

### Use semantic HTML

Leverage native HTML elements that communicate their purpose effectively:

- Use appropriate tags for actions: `<button>`, `<a>`, `<select>` instead of `<div>` or `<span>`.
- Structure your layout with semantic elements: `<nav>`, `<main>`, `<header>`, `<footer>`.
- Always pair `<label>` elements with form controls using `for` and `id`. Avoid relying solely on `placeholder` text for labeling.

### Set the correct document language

Proper language settings help screen readers use accurate pronunciation and intonation:

- Add `lang="en"` (or the appropriate language code) to the `<html>` tag.

### Ensure accessible forms

All form fields must be clearly labeled, and error states must be identifiable:

- Use `<label for="input-id">`, `aria-label`, or `aria-labelledby`.
- Provide error messages that are clear and easy to locate.
- Don’t rely solely on color (e.g., red) to indicate errors. You can also use icons or text.
- Use `aria-describedby` to connect input fields to help or error messages.

### Manage focus

Ensure users know where they are and can move through the interface logically:

- Use `tabindex="0"` for custom interactive elements. Try not to mess around with the tabindex if possible, and keep the "natural" tab flow.
- Do not remove focus outlines unless replaced with a clear, visible alternative.
- Use `focus()` to direct user attention (e.g., after form errors or modal open).
- Each interactive element that can be clicked or navigated by keyboard (`<a>`, `<button>`, etc.) must have a clearly visible focus indication.

### Keyboard accessibility

Users should be able to navigate and interact with all features using only the keyboard:

- Ensure `Enter` and `Space` activate interactive elements.
- Avoid using `onclick` on non-focusable elements without keyboard support.
- Custom widgets must respond to arrow keys and expected keyboard patterns.

### Use ARIA carefully

Use ARIA roles and attributes only when native HTML doesn’t work.

- Use `role="alert"` for live error messaging.
- Apply `aria-expanded`, `aria-controls`, and `aria-hidden` for toggleable UI elements.
- Prefer native HTML elements over ARIA whenever possible to reduce complexity.

### Provide live region updates

Ensure real-time changes are accessible:

- Use `aria-live="polite"` or `aria-live="assertive"` for real-time updates (e.g., validation messages, chat widgets).

### Manage page titles and headings

Headings and titles provide structure and orientation. It helps users understand page structure:

- Always update the `<title>` tag on page load or route change.
- Use one `<h1>` per page, followed by correct heading hierarchy (`<h2>`, `<h3>`, etc.).

### Support skip links

Help keyboard users skip repetitive content:

- Include a skip link at the top of the page:
  
 ```html
  <a href="#main-content" class="skip-link">Skip to main content</a>
 ```

### Control focus when using modals or popovers

Focus should remain within the modal and return to the trigger element after closing:

- Trap focus while the modal is open.
- Return focus to the initiating element once it is closed.

### Avoid auto-playing audio or video

If unavoidable, make sure users can easily pause or stop it:

- Provide controls on `<video>` or `<audio>` elements.
- Avoid autoplay unless muted and non-disruptive.

### Ensure unique IDs and ARIA attributes

Avoid duplicated IDs to maintain screen reader reliability:

- Validate that `id` attributes are unique.
- Ensure any referenced IDs in `aria-labelledby` or `aria-describedby` exist and are not duplicated.

### Test with assistive technologies

Test your site with real-world tools and scenarios:

- Use screen readers like NVDA (Windows), VoiceOver (macOS).
- Navigate with only the keyboard (Tab, Shift+Tab, Enter, Space).
- Leverage browser dev tools (Chrome DevTools > Accessibility, Axe Core).

## Conclusion

Following this checklist will help ensure your storefront is usable by everyone, regardless of ability. It also improves SEO, performance, and user satisfaction for all visitors.

Regularly audit your code, test with assistive technologies, and stay up to date with evolving accessibility standards. Inclusive design is good design.
