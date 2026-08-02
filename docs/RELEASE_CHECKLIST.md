# Release Checklist — Sprint 9 (v0.10.0)

Use this checklist prior to merging the Sprint 9 feature branch into `main` and deploying to production.

---

## 1. Codebase & Quality Verification

- [x] All **63/63 Jest unit tests** pass cleanly (`npm test`).
- [x] Production bundle builds with **0 errors** (`npm run build`).
- [x] Linter check reports **0 errors** (`npx oxlint`).
- [x] Feature branch `feature/sprint-9-social-experience-founder-platform` is up to date.

---

## 2. Environment & Configuration

- [x] `FOUNDER_EMAIL` configured in environment variables (`udayshankarpandey.03@gmail.com`).
- [x] MongoDB URI and JWT secrets verified.
- [x] ImageKit credentials configured for profile avatar and cover image storage.

---

## 3. Database & Migration

- [x] Run `node scripts/seed-founder.js` to ensure founder role promotion for existing matching accounts.
- [x] Schema extensions for `coverPicUrl`, `bio`, `socials`, `pinnedPost`, `status` verified on `User` model.
- [x] `AuditLog` collection created and indexed by `createdAt: -1`.

---

## 4. Final Merge & Release Tagging

- [ ] Obtain explicit user approval for merge.
- [ ] Merge `feature/sprint-9-social-experience-founder-platform` into `main`.
- [ ] Tag release `v0.10.0` in Git repository:
  ```bash
  git tag -a v0.10.0 -m "Sprint 9 — Social Experience & Founder Platform Release"
  git push origin v0.10.0
  ```
