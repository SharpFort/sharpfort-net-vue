# 🤖 自动同步工作流使用指南

## 📋 概述

GitHub Actions 工作流已配置完成，将自动同步上游仓库（art-design-pro）的更新。

**工作流文件**: `.github/workflows/sync-upstream.yml`

## ⏰ 触发方式

### 1. 自动触发（定时任务）
- **时间**: 每天北京时间早上 8:00（UTC 0:00）
- **动作**: 自动检查上游更新并执行同步

### 2. 手动触发
1. 访问你的 GitHub 仓库
2. 点击 **Actions** 标签页
3. 在左侧选择 **Sync Upstream & Lite** 工作流
4. 点击右上角 **Run workflow** 按钮
5. 选择分支（默认 main）并点击 **Run workflow**

## 🔄 工作流程

### Stage 1: 同步 upstream-main
- 从官方仓库拉取最新代码
- 更新 `upstream-main` 分支

### Stage 2: 同步 adapter-lite
- 将 `upstream-main` 合并到 `adapter-lite`
- **自动处理冲突**（见下文）
- 重新运行 `pnpm clean:dev` 精简脚本
- 推送更新

### Stage 3: 创建 PR
- 自动创建从 `adapter-lite` 到 `main` 的 Pull Request
- 标签: `automated-sync`, `upstream-update`
- **等待你的审核和合并**

## 🔧 冲突处理策略

工作流会自动处理以下冲突类型：

| 冲突类型 | 说明 | 处理策略 |
|---------|------|---------|
| `UD` | 上游删除，我们修改 | ✅ 保留删除 |
| `DU` | 我们删除，上游修改 | ✅ 保留删除（精简目的）|
| `AA` | 双方都添加同一文件 | ✅ 保留上游版本 |
| `UU` | 双方都修改同一文件 | ✅ 保留上游版本（保守策略）|

### ⚠️ 无法自动处理的情况
- 复杂的内容冲突（需要人工判断）
- 工作流会标记失败，需要手动介入

## 🔀 同步策略切换

### 当前策略：同步最新代码
默认配置会同步 `upstream/master` 分支的**最新提交**（无论是否发布 Release）。

### 可选策略：只同步 Release 版本
如果你只想同步官方发布的 Release 版本：

1. 打开 `.github/workflows/sync-upstream.yml`
2. 找到 **Stage 1** 部分
3. **注释掉**当前的 "Sync Upstream Main (Latest Code)" 步骤
4. **取消注释** "Sync Upstream Main (Latest Release)" 步骤
5. 提交并推送更改

```yaml
# 注释掉这个（同步最新代码）
# - name: Stage 1 - Sync Upstream Main (Latest Code)
#   run: |
#     ...

# 取消注释这个（只同步 Release）
- name: Stage 1 - Sync Upstream Main (Latest Release)
  run: |
    ...
```

## 📧 PR 审核流程

### 1. 收到通知
- GitHub 会发送邮件通知你有新的 PR
- 标题格式: `🔄 Upstream Sync: 2025-12-30`

### 2. 审核 PR
1. 点击邮件中的链接或访问仓库的 **Pull requests** 标签页
2. 查看 **Files changed** 标签页
3. 检查改动是否符合预期
4. 确认没有破坏业务逻辑

### 3. 合并或关闭
- ✅ **如果一切正常**: 点击 **Merge pull request**
- ❌ **如果有问题**: 关闭 PR 并手动处理

## 🐛 故障排查

### 问题 1: 工作流失败
**症状**: Actions 页面显示红色 ❌  
**原因**: 可能遇到无法自动解决的冲突  
**解决**:
1. 查看失败的步骤日志
2. 本地手动执行同步
3. 解决冲突后推送

### 问题 2: 没有创建 PR
**症状**: 工作流成功但没有 PR  
**原因**: 上游没有新更新  
**解决**: 这是正常的，无需操作

### 问题 3: PR 中有意外更改
**症状**: PR 包含不应该有的文件  
**原因**: 精简脚本可能需要调整  
**解决**:
1. 不要合并 PR
2. 检查 `scripts/clean-dev.ts`
3. 调整精简规则
4. 手动重新同步

## 📊 监控和日志

### 查看执行历史
1. 访问 **Actions** 标签页
2. 选择 **Sync Upstream & Lite** 工作流
3. 查看所有运行记录

### 查看详细日志
1. 点击某次运行
2. 展开各个步骤查看详细输出
3. 搜索关键词（如 "conflict", "error"）

## 🎯 最佳实践

### 1. 定期检查
- 每周查看一次 Actions 页面
- 确保工作流正常运行

### 2. 及时处理 PR
- 收到 PR 通知后尽快审核
- 避免积压多个 PR

### 3. 测试后合并
- 合并 PR 后在本地测试
- 确保项目正常运行

### 4. 保持精简脚本更新
- 如果官方添加新的演示内容
- 及时更新 `scripts/clean-dev.ts`

## 🔐 权限说明

工作流使用 `GITHUB_TOKEN`，具有以下权限：
- ✅ `contents: write` - 推送代码到分支
- ✅ `pull-requests: write` - 创建 PR

这些权限是自动提供的，无需额外配置。

## 📝 自定义配置

### 修改运行时间
编辑 `cron` 表达式：
```yaml
schedule:
  - cron: '0 0 * * *'  # 每天 UTC 0:00
  # 改为每周一运行：'0 0 * * 1'
  # 改为每月1号运行：'0 0 1 * *'
```

### 修改 PR 标签
编辑 `labels` 字段：
```yaml
labels: automated-sync,upstream-update,my-custom-label
```

---

**一切就绪！** 工作流将在明天早上 8:00 首次自动运行，或者你可以立即手动触发测试。🚀
