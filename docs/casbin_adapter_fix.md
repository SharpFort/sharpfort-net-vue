# Casbin.Adapter.SqlSugar - SQLite Lock Fix Analysis

## 1. Stack Trace Analysis

The error occurs specifically here:

```csharp
at Casbin.Adapter.SqlSugar.SqlSugarAdapter.SavePolicyWithSharedTransactionAsync(...)
at SqlSugar.AdoProvider.BeginTran()
at Microsoft.Data.Sqlite.SqliteConnection.BeginTransaction(...)
=> SQLite Error 5: 'database is locked'
```

### Context

- **Caller**: `Yi.Framework...RoleService.UpdateAsync` (Likely running inside an ABP Unit of Work / EF Core Transaction).
- **Conflict**:
  1.  **Transaction A (Outer)**: ABP/EF Core starts a transaction for `RoleService.UpdateAsync`. -> **Acquires Reserved/Exclusive Lock** on the DB.
  2.  **Transaction B (Inner)**: `SqlSugarAdapter` creates a _new_ connection (default behavior) and calls `BeginTran()`.
  3.  **Deadlock**: Transaction B attempts to acquire a lock to write. It cannot because Transaction A holds it. Transaction B waits (BusyTimeout) and then fails.

## 2. Solution Strategy

Since you maintain the `Casbin.Adapter.SqlSugar` package, you have two powerful options to improve it.

### Option A: Support External Transactions (Recommended)

Modify the Adapter so it can "piggyback" on an existing transaction/connection provided by the caller.

### Option B: Conditional Transaction Logic

Modify `SavePolicyWithSharedTransactionAsync` to check if a transaction is already running.

## 3. Recommended Code Changes

### Fix 1: Add `useTransaction` Parameter

Allow the caller to decide whether the Adapter should manage the transaction.

```csharp
// In SqlSugarAdapter.cs

public async Task SavePolicyWithSharedTransactionAsync(IPolicyStore store, List<List<string>> rules, bool useTransaction = true)
{
    var db = _db; // Your SqlSugarClient instance
    bool isLocalTransaction = false;

    try
    {
        // Only start a transaction if requested AND one isn't already active on this client
        if (useTransaction && db.Ado.Transaction == null)
        {
            await db.Ado.BeginTranAsync();
            isLocalTransaction = true;
        }

        // ... Execute your delete/insert logic ...
        // db.Deleteable(...).ExecuteCommand();
        // db.Insertable(...).ExecuteCommand();

        if (isLocalTransaction)
        {
            await db.Ado.CommitTranAsync();
        }
    }
    catch
    {
        if (isLocalTransaction) await db.Ado.RollbackTranAsync();
        throw;
    }
}
```

### Fix 2: Connection Sharing (The Root Fix for SQLite)

Even with Fix 1, if `SqlSugarClient` uses a _different connection_ object than ABP's `DbContext`, you will **still** get a lock error because SQLite locks are per-connection.

**Requirement**: `SqlSugarAdapter` must accept an existing `IDbConnection` or ensure `SqlSugarClient` is initialized with the same connection string + **WAL Mode enabled**.

**Best Practice Advice for your Library Users**: "If using SQLite with other ORMs (like EF Core), you MUST enable WAL Mode (`PRAGMA journal_mode=WAL;`) OR share the `IDbConnection` instance with the SqlSugarAdapter."

## 4. Immediate Verification Steps

1.  **Enable WAL Mode**: Run `PRAGMA journal_mode = WAL;` on your `.db` file. This resolves 95% of multi-connection issues.
2.  **Apply Fix 1**: Update your package code to handle conditional transactions.
