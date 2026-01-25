# SQLite 'Database is Locked' Error Analysis

## Problem Description

- **Frontend Error**: `Network connection exception` (HTTP 400/500 depending on gateway, but stack trace shows connection issue likely due to timeout).
- **Backend Error**: `SQLite Error 5: 'database is locked'`.
- **Operation**: Updates Role Permissions (`PUT /api/app/role/{id}`).
- **Timing**: Error occurs ~30 seconds after operation start (default SQLite Busy Timeout).

## Root Cause Analysis

This error is a classic **SQLite Concurrency/Locking** issue.

1.  **Transaction Conflict (Most Likely)**:
    - The `Update Role` operation in the backend likely starts a database transaction (ABP Framework default behavior for AppServices).
    - Inside this transaction, the code updates the Role entity in the main `DbContext`.
    - It _also_ calls the Casbin Enforcer to update permissions (e.g., `casbin_rule` table).
    - **The Conflict**: If the Casbin Adapter (e.g., `SqlSugarAdapter`) attempts to open a **new, separate connection** to the SQLite database while the main ABP transaction is still open (and holding a Write Lock), the new connection will be blocked. It waits 30 seconds and then fails with "database is locked".

2.  **Frontend Double Request**:
    - The `savePermission` function calls `get` then `update`. This is generally fine, but if the `get` holds a lock (unlikely for reads unless in legacy journal mode) or if the user clicks "Save" double, it could cause issues. However, the stack trace points to a backend-side lock.

## Solutions

### Solution 1: Enable WAL Mode (Highly Recommended)

Write-Ahead Logging (WAL) significantly improves SQLite concurrency by allowing readers to not block writers and vice versa.

**Action**: Execute the following SQL command on your database once:

```sql
PRAGMA journal_mode = WAL;
```

_Note: You can do this using a DB tool (DBeaver, Navicat) or add a startup check in your C# code._

### Solution 2: Share Connection / Transaction

Ensure Casbin uses the _same_ database connection and transaction as the current HTTP request scope.

- If using `SqlSugar`, ensure it is not creating a new `Client` but using the existing one or that the scoped operations are strictly sequential and do not overlap in a way that requires two connections.
- **Immediate Fix**: If you cannot easily refactor the adapter, move the Casbin update _outside_ the main Role Update transaction, or ensure the Role Update transaction is committed before Casbin starts (though this reduces data consistency safety).

### Solution 3: Increase Timeout

Increase the "Busy Timeout" in your connection string. This allows the second connection to wait longer for the first to finish.

**Connection String Example**:

```
Data Source=your.db;Cache=Shared;Mode=ReadWriteCreate;BusyTimeout=10000;
```

_Change `BusyTimeout` to a higher value (e.g., 10000ms or more)._

### Solution 4: Frontend Optimization (Mitigation)

Although acceptable, fetching the full role details (`CasbinApi.role.get`) right before update increases the time the user interacts. You could send _only_ the `menuIds` to a dedicated API endpoint (e.g., `PUT /api/app/role/{id}/permissions`) instead of updating the entire Role object. This would reduce the backend processing time and complexity.

## Recommendation for Verification

1.  **First**: Enable WAL mode (`PRAGMA journal_mode = WAL;`). This resolves 90% of SQLite lock issues in web apps.
2.  **Second**: Check the backend logs to confirm if `UpdateAsync` and Casbin operations are using different connections.
