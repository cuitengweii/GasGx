# Sales 双角色测试运行说明

## 1) 设置环境变量（PowerShell）

```powershell
$env:GX_ADMIN_EMAIL="cuitengwei@gasgx.com"
$env:GX_ADMIN_PASSWORD="cuitengwei2023"

# 客户账号（建议独立账号；若暂时没有，可先与管理员同账号联调）
$env:GX_CUSTOMER_EMAIL="your-customer@email.com"
$env:GX_CUSTOMER_PASSWORD="your-customer-password"
```

## 2) 执行双角色测试

```powershell
npx playwright test tests/playwright/sales-auth-roles.spec.ts
```

## 3) 结果解释

- `admin can sign in to sales console`：验证销售后台管理员登录链路。
- `customer can sign in from public account page`：验证客户账号登录链路。
- 若缺少环境变量，测试会自动 `skip`，不会误报失败。

## 4) 客户模拟建议

- 公开需求/确认页（`quote/requirement.html`、`quote/confirmation.html`）可直接用 token 链接模拟客户，无需登录。
- 报价确认动作在 `quote/view.html` 受保护，需登录且邮箱匹配报价绑定邮箱。
