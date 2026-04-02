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
