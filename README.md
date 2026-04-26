# 恋爱相册部署说明

这个项目可以直接部署为静态网站，例如 GitHub Pages、Gitee Pages、Netlify、Vercel 等。

## 重要说明

当前项目里有两种媒体来源：

1. **仓库公开媒体**
   - 写在 `media.config.js` 里
   - 文件放在仓库里，例如 `assets/photos/`、`assets/videos/`
   - **上传到 Git 后，所有设备访问网站都能看到**

2. **浏览器本地上传媒体**
   - 通过网页里的“上传照片 / 上传视频”添加
   - 数据保存在当前浏览器的 `IndexedDB`
   - **只在当前浏览器可见，换手机或电脑不会同步**

## 推荐目录

```text
assets/
  photos/
  videos/
```

## 如何让图片和视频在公开网站正常显示

1. 把图片放进 `assets/photos/`
2. 把视频放进 `assets/videos/`
3. 编辑 `media.config.js`
4. 使用**相对路径**，不要写以 `/` 开头的绝对路径

### 照片示例

```js
{
  src: 'assets/photos/our-first-trip.jpg',
  title: '第一次旅行',
  desc: '那天真的很开心。',
  date: '2026.04.26',
  author: 'me'
}
```

### 视频示例

```js
{
  src: 'assets/videos/sunset-walk.mp4',
  title: '一起散步的傍晚',
  desc: '落日很美，你也很美。',
  date: '2026.04.26',
  author: 'her'
}
```

## 上传到 Git 并生成网站

### GitHub Pages

1. 新建 GitHub 仓库并上传本项目
2. 打开仓库 `Settings`
3. 找到 `Pages`
4. Source 选择部署分支，例如 `main`
5. 保存后等待生成
6. 网站通常会出现在：`https://你的用户名.github.io/仓库名/`

## 部署前检查清单

- `index.html`、`styles.css`、`script.js` 使用的都是相对路径
- `media.config.js` 中的 `src` 也是相对路径
- 图片和视频文件名尽量使用英文、数字、短横线，避免空格和中文
- 视频建议使用 `mp4`
- 图片建议使用 `jpg`、`png`、`webp`

## 大量照片和视频的发布建议

- 页面现在已经改成**默认分批加载**，不会一打开就把全部媒体都渲染出来
- 单张图片尽量压到 **1 MB** 内，优先使用 `webp` 或压缩后的 `jpg`
- 单个公开视频尽量控制在 **15 MB - 25 MB** 内，格式优先 `mp4 (H.264)`
- 不要把 B 站、网盘分享页、普通网页地址直接填进 `video src`
- 如果视频很多，优先先放封面和精选内容，剩余内容再逐步补充

如果你要，我下一步可以继续帮你：

- 直接生成 `assets/photos` 和 `assets/videos` 目录结构
- 帮你把项目调整成更适合 `GitHub Pages` 的发布版本
- 帮你整理一份 `git init` 到 `push` 的完整命令
