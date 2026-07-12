# 流响音乐 · 视唱练耳训练系统

移动端优先的 Web App 原型，面向音乐艺考学生的“自动训练 + 老师诊断”闭环。

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth / Postgres / Storage
- Web Audio API / MediaRecorder API

## 模块策略

所有训练能力统一抽象为 `module`：

- `sight_singing`：第一版启用
- `ear_training`：第一版启用
- `theory`：第一版预留，默认禁用

## 本地运行

```bash
pnpm install
pnpm dev
```

打开：

- 电脑浏览器：http://localhost:3000
- 手机同一局域网预览：先运行 `pnpm dev --hostname 0.0.0.0`，再用手机访问 `http://你的电脑局域网IP:3000`

如果没有配置 Supabase 环境变量，系统会进入 Demo 模式，使用本地 mock data，不会白屏。复制 `.env.example` 为 `.env.local`，填入 Supabase 项目配置后即可逐步接入真实登录与数据。

## 内部测试访问保护

远程 Demo 如果只给内部测试人员体验，可以在 Vercel 环境变量中开启轻量访问门禁：

```bash
NEXT_PUBLIC_DEMO_ACCESS_ENABLED=true
NEXT_PUBLIC_DEMO_ACCESS_PASSWORD=你的内部测试密码
```

说明：

- 这是内部 Demo 门禁，不是正式用户登录或安全权限系统。
- 密码正确后会保存在浏览器 `localStorage`，避免每次刷新都重新输入。
- 如果 `NEXT_PUBLIC_DEMO_ACCESS_PASSWORD` 为空，访问保护默认不启用。

## 当前可预览页面

- `/`：Web App 首页入口
- `/dashboard`：学生首页
- `/sight-singing/practice/sg-001`：视唱录音、音高分析、老师反馈 Demo、对应训练资源
- `/ear-training`：练耳入口和老师布置的 Demo 任务
- `/ear-training/practice/ear-single-001`：练耳播放、答题、自动判分、对应训练资源
- `/teacher`：老师后台原型入口
- `/teacher/sight-singing/question-bank/sight_teacher_001`：训练资源链接管理 Demo
- `/theory`、`/teacher/theory`：乐理模块预留

## Web App / PWA 预留

项目已包含基础移动端元数据、主题色、Web App manifest 与品牌图标占位。当前还不是完整离线 PWA；后续如需增强，需要补 service worker、离线缓存策略、安装提示、图标多尺寸 PNG、推送或后台同步等能力。

## 部署到 Vercel

1. 将项目推送到 GitHub。
   ```bash
   git init
   git add .
   git commit -m "Prepare Liuxiang Web App demo"
   git branch -M main
   git remote add origin <你的 GitHub 仓库地址>
   git push -u origin main
   ```
2. 在 Vercel 新建项目，导入该 GitHub 仓库。
3. Framework Preset 选择 `Next.js`。
4. Install Command 填 `pnpm install`。
5. Build Command 填 `pnpm build`。
6. Output Directory 不需要填写，保持 Vercel 默认。
7. Node 版本建议使用 Vercel 默认的现代 Node 运行时；项目已声明 `node >=20.18.0`。
8. 环境变量：
   - 不接 Supabase 时可不填 Supabase 变量，系统会进入 Demo 模式。
   - 内部测试门禁可填 `NEXT_PUBLIC_DEMO_ACCESS_ENABLED=true` 和 `NEXT_PUBLIC_DEMO_ACCESS_PASSWORD=你的内部测试密码`。
   - 后续接真实数据时再填 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`。
9. 部署后访问 Vercel 生成的网址，先验证 `/`、`/dashboard`、视唱练习、练耳练习、老师后台和训练资源链接管理。

## 旧资产

仓库原有的 `index.html`、`assets/`、`output/` 是“流响音乐动态尾图”素材，本次保留不删除。Next.js App 使用 `public/brand/end-card.png` 作为品牌视觉资产副本。
