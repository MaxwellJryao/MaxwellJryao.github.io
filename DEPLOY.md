# GitHub Pages 部署指南

## 快速开始

### 前提条件
- ✅ 已安装 Git
- ✅ 已创建 GitHub 账号（用户名：MaxwellJryao）
- ✅ 已创建仓库：`MaxwellJryao.github.io`

### 部署步骤

1. **初始化 Git 仓库（如果还没有）**
   ```bash
   cd /shared/storage-01/jiarui14/personal/homepage/MaxwellJryao.github.io
   git init
   ```

2. **检查 Git 状态**
   ```bash
   git status
   ```
   确保所有需要的文件都在（HTML、CSS、JS、图片等）

3. **添加文件并提交**
   ```bash
   git add .
   git commit -m "Initial commit: Personal homepage"
   ```

4. **连接到 GitHub 仓库**
   ```bash
   git remote add origin https://github.com/MaxwellJryao/MaxwellJryao.github.io.git
   ```
   如果已经存在 remote，使用：
   ```bash
   git remote set-url origin https://github.com/MaxwellJryao/MaxwellJryao.github.io.git
   ```

5. **推送到 GitHub**
   ```bash
   git branch -M main
   git push -u origin main
   ```

6. **启用 GitHub Pages**
   - 访问：https://github.com/MaxwellJryao/MaxwellJryao.github.io/settings/pages
   - Source: 选择 "Deploy from a branch"
   - Branch: 选择 `main`，文件夹选择 `/ (root)`
   - 点击 "Save"

7. **等待部署**
   - 通常需要 1-5 分钟
   - 可以在仓库的 "Actions" 标签页查看部署状态

8. **访问网站**
   - 访问：https://MaxwellJryao.github.io

## 更新网站

每次修改后：

```bash
git add .
git commit -m "描述你的更改"
git push
```

GitHub Pages 会自动重新部署。

## 检查清单

部署前确认：

- [ ] `.nojekyll` 文件存在（已创建）
- [ ] `index.html` 在根目录
- [ ] 所有资源路径都是相对路径（如 `css/styles.css`，不是 `/css/styles.css`）
- [ ] `_site/` 目录在 `.gitignore` 中（不会被提交）
- [ ] 仓库名称正确：`MaxwellJryao.github.io`
- [ ] 仓库设置为 Public

## 常见问题

### 1. 404 错误
- 等待几分钟，GitHub Pages 需要时间部署
- 检查仓库名称是否正确
- 确认 GitHub Pages 已启用

### 2. CSS/JS 不加载
- 检查文件路径是否为相对路径
- 确认文件已提交到仓库
- 检查浏览器控制台的错误信息

### 3. 图片不显示
- 确认图片文件已提交
- 检查图片路径是否正确（如 `assets/favicon1.png`）

### 4. 数学公式不渲染
- 确认 KaTeX CDN 链接正常
- 检查浏览器控制台是否有错误

## 验证部署

部署成功后，检查：

1. ✅ 网站可以访问：https://MaxwellJryao.github.io
2. ✅ 所有样式正常显示
3. ✅ JavaScript 功能正常（新闻加载、主题切换等）
4. ✅ 图片正常显示
5. ✅ 数学公式正常渲染（如果有）

## 自定义域名（可选）

如果想使用自定义域名：

1. 在仓库 Settings > Pages 中添加自定义域名
2. 在域名 DNS 中添加 CNAME 记录
3. 在项目根目录创建 `CNAME` 文件，内容为你的域名

