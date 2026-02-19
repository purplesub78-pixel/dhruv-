# Auth-Gated App Testing Playbook

## IMPORTANT - Read this before testing authentication

NOTE: Do not be satisfied until you've tested the app completely, especially the auth gated pages.

## Step 1: Create Test User & Session

```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,  // Custom UUID field (MongoDB's _id is separate/internal)
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  role: 'client',  // or 'admin', 'talent'
  picture: 'https://via.placeholder.com/150',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,  // Must match user.user_id exactly
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend API

```bash
# Test auth endpoint
curl -X GET "http://localhost:8001/api/auth/me" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Test protected endpoints
curl -X GET "http://localhost:8001/api/projects" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

curl -X POST "http://localhost:8001/api/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{"title": "Test Project", "budget": "50000-100000"}'
```

## Step 3: Browser Testing

```javascript
// Set cookie and navigate
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "localhost",
    "path": "/",
    "httpOnly": true,
    "secure": false,  // false for localhost
    "sameSite": "Lax"
}]);
await page.goto("http://localhost:3000/dashboard");
```

## Quick Debug

```bash
# Check data format
mongosh --eval "
use('test_database');
db.users.find().limit(2).pretty();
db.user_sessions.find().limit(2).pretty();
"

# Clean test data
mongosh --eval "
use('test_database');
db.users.deleteMany({email: /test\.user\./});
db.user_sessions.deleteMany({session_token: /test_session/});
"
```

## Checklist

- [ ] User document has user_id field (custom UUID, MongoDB's _id is separate)
- [ ] Session user_id matches user's user_id exactly
- [ ] All queries use `{"_id": 0}` projection to exclude MongoDB's _id
- [ ] Backend queries use user_id (not _id or id)
- [ ] API returns user data with user_id field (not 401/404)
- [ ] Browser loads dashboard (not login page)

## Success Indicators

✅ /api/auth/me returns user data
✅ Dashboard loads without redirect
✅ CRUD operations work
✅ Role-based access control works

## Failure Indicators

❌ "User not found" errors
❌ 401 Unauthorized responses
❌ Redirect to login page
❌ CORS errors
❌ Cookie not set

## Common Issues & Solutions

### Issue: "User not found"
**Solution:** Check if user_id in sessions collection matches user_id in users collection

### Issue: 401 Unauthorized
**Solution:** Verify session_token is valid and not expired

### Issue: Dashboard redirects to login
**Solution:** Check if /api/auth/me endpoint is working correctly

### Issue: CORS errors
**Solution:** Verify backend CORS is configured to allow credentials from frontend origin
