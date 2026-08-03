# Release Checklist — Version 0.11.0 (Sprint 10)

**Target Tag**: `v0.11.0`  
**Branch**: `feature/sprint-10-community-discovery`  
**Target Branch**: `main`  
**Release Date**: August 2026  

---

### Pre-Release Quality Gates Checklist

- [x] **Vite Client Production Build**: Executed `cd client && npm run build`. Built cleanly in 1.24s with zero errors.
- [x] **Jest Test Suite**: Executed `npm test`. All 13 test suites passed (`75/75` individual unit tests passing).
- [x] **Linter & Static Analysis**: Executed `npx oxlint`. 0 errors, 0 blocking warnings.
- [x] **Responsive Layout Verification**: Audited viewports 320px, 375px, 768px, 1024px, and 1440px+ across Feed, Profile, Saved Posts, Post Detail, Create Post, Polls, Lightbox Carousel, and Reaction Popovers. Zero content clipping or horizontal overflow.
- [x] **Accessibility Audit (WCAG 2.1 AA)**: Verified keyboard navigation, visible focus states (`focus-visible:ring-2 focus-visible:ring-amber`), semantic HTML structure, proper heading hierarchy (`h1` per page), and ARIA attributes across all Sprint 10 components (`PostEditor`, `ImageCarousel`, `PollCard`, `PostActions`, `SidebarWidgets`, `CommentSection`).
- [x] **SonarQube Quality Standards**: Cognitive complexity kept low, nested ternaries eliminated, array index keys avoided, optional chaining used, zero unused variables or imports.
- [x] **Founder Platform Protections**: Verified Founder-first role security, single Founder account constraint, Founder protection against suspension/soft deletion, and audit logging.
- [x] **GitHub Actions Workflow Readiness**: CI pipeline step definitions verified for automated build and test runs.
- [x] **PR Readiness**: Working tree audited; code organized into clean, reviewable atomic commits.

---

### Release Tag & Merging Steps (Post-Approval)

1. Merge branch `feature/sprint-10-community-discovery` into `main`.
2. Tag release: `git tag -a v0.11.0 -m "Release v0.11.0: Community Discovery & Rich Content Experience"`
3. Push main branch and tag to remote repository: `git push origin main --tags`
