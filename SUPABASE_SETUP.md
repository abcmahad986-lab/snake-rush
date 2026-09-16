# 🔐 Supabase Google OAuth 配置指南

## ✅ 已完成的更新

您的 Supabase 客户端配置已更新为使用项目 URL：
- **Project URL**: `https://upwmsvpqedbkpysfbhda.supabase.co`
- **Google OAuth**: 已集成真正的 Supabase 身份验证

---

## 📋 设置步骤

### 1. 获取 Supabase Anon Key

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的项目：`upwmsvpqedbkpysfbhda`
3. 进入 **Project Settings** > **API**
4. 复制 **anon public** 密钥（以 `eyJ...` 开头的长字符串）

### 2. 创建 .env 文件

在项目根目录创建 `.env` 文件：

```bash
# .env
VITE_SUPABASE_URL=https://upwmsvpqedbkpysfbhda.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**重要**：将 `your_anon_key_here` 替换为您从 Supabase 仪表板复制的实际 anon key。

### 3. 在 Supabase 中配置 Google OAuth

#### 步骤 3.1: 启用 Google Provider

1. 在 Supabase Dashboard 中，进入 **Authentication** > **Providers**
2. 找到 **Google** 并点击 **Configure**
3. 开启 **Enable Sign in with Google**

#### 步骤 3.2: 获取 Google OAuth 凭据

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 进入 **APIs & Services** > **Credentials**
4. 点击 **Create Credentials** > **OAuth client ID**
5. 选择 **Web application**
6. 配置以下设置：

**Authorized JavaScript origins:**
```
http://localhost:3000
https://your-vercel-domain.vercel.app
```

**Authorized redirect URIs:**
```
https://upwmsvpqedbkpysfbhda.supabase.co/auth/v1/callback
```

7. 点击 **Create**
8. 复制 **Client ID** 和 **Client Secret**

#### 步骤 3.3: 在 Supabase 中配置 Google 凭据

1. 返回 Supabase Dashboard > **Authentication** > **Providers** > **Google**
2. 粘贴 **Client ID** 和 **Client Secret**
3. 点击 **Save**

### 4. 测试登录

1. 启动开发服务器：`npm run dev`
2. 导航到 Google Login 页面
3. 点击 **Continue with Google**
4. 您应该被重定向到 Google 登录页面
5. 登录后，您将被重定向回应用，并显示已连接状态

---

## 🔧 代码更改说明

### 已更新的文件

1. **`src/lib/supabase.ts`** - Supabase 客户端配置
   - 使用您的项目 URL
   - 从环境变量读取 anon key
   - 添加配置警告

2. **`src/vite-env.d.ts`** - Vite 环境变量类型定义
   - 定义 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`

3. **`.env.example`** - 环境变量示例文件
   - 包含配置说明

4. **`src/components/PremiumScreens.tsx`** - GoogleLoginScreen 组件
   - 使用真正的 Supabase OAuth
   - 添加加载状态和错误处理
   - 移除演示模式文本
   - 自动检测已认证用户

---

## 🔒 安全注意事项

### 环境变量

- ✅ **anon key 是公开的**：可以安全地放在前端代码中
- ❌ **service_role key 是私有的**：永远不要在前端使用
- ✅ **使用 .env 文件**：不要将 .env 提交到 Git
- ✅ **在 Vercel 中配置**：在 Vercel Dashboard 的环境变量部分添加相同的变量

### Vercel 部署

在 Vercel Dashboard 中：
1. 进入您的项目设置
2. 导航到 **Environment Variables**
3. 添加以下变量：
   - `VITE_SUPABASE_URL` = `https://upwmsvpqedbkpysfbhda.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `您的实际 anon key`
4. 重新部署应用

---

## 🎯 功能特性

### Google OAuth 流程

1. 用户点击 **Continue with Google**
2. 重定向到 Google 登录页面
3. 用户授权应用
4. 重定向回 Supabase 回调 URL
5. Supabase 创建/更新用户会话
6. 重定向回应用
7. 应用检测到已认证用户
8. 显示连接成功状态

### 自动检测

- 组件挂载时自动检查用户是否已认证
- 如果已认证，自动更新玩家数据
- 显示已连接的 Google 账户邮箱

### 错误处理

- 显示认证错误消息
- 加载状态指示器
- 禁用按钮防止重复点击

---

## 🐛 故障排除

### 问题：点击按钮后没有反应

**解决方案**：
1. 检查浏览器控制台是否有错误
2. 确认 anon key 已正确配置
3. 确认 Google Provider 已在 Supabase 中启用

### 问题：重定向后未登录

**解决方案**：
1. 检查 Supabase Dashboard > **Authentication** > **Users** 中是否创建了用户
2. 确认回调 URL 已正确配置
3. 检查浏览器控制台是否有错误

### 问题：环境变量未加载

**解决方案**：
1. 重启开发服务器
2. 确认 .env 文件在项目根目录
3. 确认变量名以 `VITE_` 开头

---

## 📚 参考资源

- [Supabase OAuth 文档](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 设置](https://support.google.com/cloud/answer/6158849)
- [Vite 环境变量](https://vitejs.dev/guide/env-and-mode.html)

---

## ✅ 验证清单

- [ ] 创建 .env 文件并添加 anon key
- [ ] 在 Supabase 中启用 Google Provider
- [ ] 在 Google Cloud Console 中创建 OAuth 凭据
- [ ] 配置回调 URL
- [ ] 测试本地登录
- [ ] 在 Vercel 中配置环境变量
- [ ] 测试生产环境登录

---

**您的 Supabase Google OAuth 集成已完成！只需按照上述步骤配置环境变量和 Google OAuth 凭据即可。** 🔐✨
