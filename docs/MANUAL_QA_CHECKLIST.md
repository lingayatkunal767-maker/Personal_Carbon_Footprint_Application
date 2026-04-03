# Manual QA Checklist

Date: 2026-04-02
Executed against backend: http://localhost:8082

## Preconditions

- Backend running with latest code on port 8082.
- Frontend build passes.
- At least one USER exists.
- At least one active in-stock marketplace product exists.

## Flow 1: Admin assign badge -> user dashboard badge unlock

Steps:
1. Get a USER from `GET /api/admin/users`.
2. Create a unique badge definition with `PUT /api/admin/badges/definitions`.
3. Assign that badge to the user with `POST /api/admin/badges/assign`.
4. Fetch user badges from `GET /api/badges/user/{userId}`.

Expected:
- Assignment API returns success message.
- User badge count increases.
- Newly assigned badge name is present in user badge list.

Result:
- PASS

## Flow 2: Cancel order -> popup prerequisite notification exists

Steps:
1. Pick active in-stock product from `GET /api/marketplace/products`.
2. Create order with `POST /api/marketplace/orders`.
3. Cancel order using `PUT /api/marketplace/orders/{id}/cancel`.
4. Fetch notifications from `GET /api/notifications/user/{userId}`.

Expected:
- Cancellation succeeds.
- A cancellation notification exists (title/message contains "cancel").
- Dashboard popup trigger condition can be satisfied by MARKETPLACE cancel notification.

Result:
- PASS

## Flow 3: Mark all read -> unread count zero

Steps:
1. Read unread count from `GET /api/notifications/user/{userId}/unread/count`.
2. Call `PUT /api/notifications/user/{userId}/read-all`.
3. Read unread count again.

Expected:
- Unread count after operation is 0.

Result:
- PASS

## Build Health

- Backend compile: PASS
- Backend tests: PASS
- Frontend build: PASS
- Vite large chunk warning: RESOLVED with manual chunk split

## Quick Responsive QA Checklist (Auth Pages, 320-375px + Landscape)

Device target:
1. Width 320px and 375px in browser device emulation.
2. Height around 640-812px.
3. Landscape 667x320 (or similar low-height mobile landscape).

Pages to verify:
1. `/login`
2. `/signup`
3. `/admin/login`
4. `/admin/signup`
5. `/auth/callback`

Checks:
1. No horizontal scroll at page level.
2. Headings and helper text stay readable without clipping.
3. Inputs, primary buttons, and secondary actions are fully visible and tappable.
4. Link rows do not overlap; they stack cleanly on narrow screens.
5. Toast/alert messages wrap inside viewport and do not overflow.
6. Password visibility toggle remains reachable and does not overlap input text.
7. Loading states (spinner + text) remain centered and readable.
8. Focus styles are visible for keyboard navigation.
9. In landscape 667x320, auth forms remain fully usable without clipped primary actions.

Expected outcome:
1. Auth flows are usable end-to-end on 320px, 375px, and 667x320 landscape with no clipped text, no overlapping actions, and no horizontal scrolling.
