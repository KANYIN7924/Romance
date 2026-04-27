---
description: 修改情侣网页时保护用户已添加内容
---

# 数据持久化规则

以后修改本项目的 HTML、CSS、JavaScript、脚本或业务逻辑时，必须遵守以下规则：

1. 不得清空用户已经在网页中添加的内容。
2. 必须保留 `localStorage` 中的 `loveAlbumCrudData` 数据。
3. 必须保留 IndexedDB 中的 `loveAlbumMediaDb` 数据。
4. 不得随意更换 `STORAGE_KEY`、`DB_NAME`、`DB_STORE`。
5. 如果新增或调整数据字段，必须通过兼容函数或迁移逻辑补默认值，例如继续使用 `normalizeState()` 兼容旧数据。
6. 修改删除、登录、权限、发布、展示逻辑时，必须保证已有照片、视频、悄悄话、时间线、删除申请等内容仍能读取和展示。
7. 只有用户明确要求清空数据时，才允许添加或执行清空数据逻辑。
8. 执行任何可能影响本地数据的操作前，应先说明风险并征得用户确认。

# 当前持久化位置

- 文本和结构化数据：`localStorage` -> `loveAlbumCrudData`
- 登录状态：`localStorage` -> `loveAlbumCurrentUser`
- 图片和视频 Blob：IndexedDB -> `loveAlbumMediaDb` / `media`

# 修改前检查

修改 `script.js` 前，优先检查：

- `loadState()`
- `normalizeState()`
- `saveState()`
- `openMediaDb()`
- `saveMedia()`
- `getMediaUrl()`
- `removeMedia()`

确保代码变更不会导致旧内容丢失。
