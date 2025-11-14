# Jiarui Yao

Personal homepage featuring a clean, minimalist design.

## Local Development

Simply open `index.html` in your browser, or use a simple HTTP server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`

## Deployment to GitHub Pages

### 方法一：使用 GitHub 网页界面（最简单）

1. **创建 GitHub 仓库**
   - 访问 [GitHub](https://github.com) 并登录
   - 点击右上角的 "+" 按钮，选择 "New repository"
   - 仓库名称必须为：`MaxwellJryao.github.io`（与你的 GitHub 用户名匹配）
   - 设置为 Public（GitHub Pages 免费版需要公开仓库）
   - 不要初始化 README、.gitignore 或 license（因为本地已有文件）

2. **上传文件到 GitHub**
   - 在项目根目录执行以下命令：
   ```bash
   cd /shared/storage-01/jiarui14/personal/homepage/MaxwellJryao.github.io
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/MaxwellJryao/MaxwellJryao.github.io.git
   git push -u origin main
   ```

3. **启用 GitHub Pages**
   - 在 GitHub 仓库页面，点击 "Settings"（设置）
   - 在左侧菜单中找到 "Pages"
   - 在 "Source" 部分，选择 "Deploy from a branch"
   - Branch 选择 `main`，文件夹选择 `/ (root)`
   - 点击 "Save"

4. **访问网站**
   - 等待几分钟后，访问：`https://MaxwellJryao.github.io`
   - GitHub Pages 通常需要几分钟来构建和部署

### 方法二：使用命令行（推荐）

如果你已经在本地配置了 Git，可以使用以下命令：

```bash
# 进入项目目录
cd /shared/storage-01/jiarui14/personal/homepage/MaxwellJryao.github.io

# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "Initial commit"

# 添加远程仓库（替换为你的实际仓库 URL）
git remote add origin https://github.com/MaxwellJryao/MaxwellJryao.github.io.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

然后按照方法一的第3步启用 GitHub Pages。

### 更新网站

每次修改后，使用以下命令更新：

```bash
git add .
git commit -m "Update website"
git push
```

GitHub Pages 会自动重新部署（通常需要几分钟）。

### 注意事项

- ✅ 仓库名称必须是 `用户名.github.io` 格式
- ✅ 确保 `.nojekyll` 文件存在（已创建，用于禁用 Jekyll 处理）
- ✅ `_site/` 目录已在 `.gitignore` 中，不会被提交
- ✅ 所有静态文件（HTML、CSS、JS、图片等）都在根目录或子目录中
- ⚠️ 首次部署可能需要 5-10 分钟才能生效
- ⚠️ 如果使用自定义域名，需要在仓库 Settings > Pages 中配置
