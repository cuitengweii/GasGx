# News Frontend Regression Rule

When a change touches any of these files or the same behavior area, treat it as a regression-sensitive edit:

- `news/modules/main.module.js`
- `news/shared/modules/channel-page.shared.js`
- `news/shared/modules/media.shared.js`
- `news/shared/modules/styles/channel-page.shared.css`

Local rule before merge or deploy:

1. Run `npm run test:smoke:web`.
2. If the change touches article list media behavior, update `scripts/smoke_check_news_media.mjs` with a new fixture before shipping.
3. If the change is homepage-only or channel-only, still run the shared smoke because the media helper is common.

What `npm run test:smoke:web` now covers:

- Static entry/module/resource checks for the news pages.
- Shared media regression fixtures for:
  - relative article image paths
  - relative article video paths
  - video poster extraction
  - inline poster/video field handling
  - homepage guard against assigning raw video URLs to `img.src`

This is the minimum gate. If a bug came from production data, add one fixture that reproduces it before closing the issue.
