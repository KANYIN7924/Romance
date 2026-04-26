const photoInput = document.querySelector('#photoInput');
const videoInput = document.querySelector('#videoInput');
const photoGallery = document.querySelector('#photoGallery');
const videoGallery = document.querySelector('#videoGallery');
const letterForm = document.querySelector('#letterForm');
const letterText = document.querySelector('#letterText');
const lettersList = document.querySelector('#lettersList');
const moodButtons = document.querySelectorAll('.mood');
const daysTogether = document.querySelector('#daysTogether');
const timelineForm = document.querySelector('#timelineForm');
const timelineDate = document.querySelector('#timelineDate');
const timelineText = document.querySelector('#timelineText');
const timelineList = document.querySelector('#timelineList');
const loginScreen = document.querySelector('#loginScreen');
const appShell = document.querySelector('#appShell');
const loginForm = document.querySelector('#loginForm');
const passwordInput = document.querySelector('#passwordInput');
const loginError = document.querySelector('#loginError');
const accountCards = document.querySelectorAll('.account-card');
const currentUserText = document.querySelector('#currentUserText');
const logoutBtn = document.querySelector('#logoutBtn');
const adminPanel = document.querySelector('#adminPanel');
const adminNavLink = document.querySelector('#adminNavLink');
const lettersNavLink = document.querySelector('#lettersNavLink');
const profileNavLink = document.querySelector('#profileNavLink');
const bulkDeleteButtons = document.querySelectorAll('[data-bulk-delete]');
const deleteRequestList = document.querySelector('#deleteRequestList');
const profileForm = document.querySelector('#profileForm');
const profileNameInput = document.querySelector('#profileNameInput');
const profileAvatarInput = document.querySelector('#profileAvatarInput');
const profilePreviewAvatar = document.querySelector('#profilePreviewAvatar');
const profilePreviewName = document.querySelector('#profilePreviewName');
const photoLoadMoreBtn = document.querySelector('#photoLoadMoreBtn');
const videoLoadMoreBtn = document.querySelector('#videoLoadMoreBtn');
const photoGalleryTip = document.querySelector('#photoGalleryTip');
const videoGalleryTip = document.querySelector('#videoGalleryTip');
const editOnlyElements = document.querySelectorAll('.edit-only');
const syncedProfileNodes = {
  me: {
    names: [document.querySelector('#loginNameMe'), document.querySelector('#loverNameMe')],
    avatars: [document.querySelector('#loginAvatarMe'), document.querySelector('#loverAvatarMe')]
  },
  her: {
    names: [document.querySelector('#loginNameHer'), document.querySelector('#loverNameHer')],
    avatars: [document.querySelector('#loginAvatarHer'), document.querySelector('#loverAvatarHer')]
  },
  admin: {
    names: [document.querySelector('#loginNameAdmin')],
    avatars: [document.querySelector('#loginAvatarAdmin')]
  },
  guest: {
    names: [document.querySelector('#loginNameGuest')],
    avatars: [document.querySelector('#loginAvatarGuest')]
  }
};

const STORAGE_KEY = 'loveAlbumCrudData';
const SESSION_KEY = 'loveAlbumCurrentUser';
const DB_NAME = 'loveAlbumMediaDb';
const DB_STORE = 'media';
const PUBLIC_MEDIA_KEY = 'LOVE_ALBUM_PUBLIC_MEDIA';
const MEDIA_BATCH_SIZE = {
  photos: 12,
  videos: 4
};
const ACCOUNTS = {
  me: { label: '我', name: '小宝', password: '5201314' },
  her: { label: '她', name: '乖乖', password: '1314520' },
  admin: { label: '管理员', name: '管理员', password: 'admin520' },
  guest: { label: '游客', name: '游客', password: '' }
};
const startDate = new Date('2024-04-30T00:00:00');
const today = new Date();
const dayDiff = Math.max(1, Math.floor((today - startDate) / 86400000) + 1);

let selectedMood = '想你';
let state = loadState();
let mediaDb;
let selectedAccount = 'me';
let currentUser = localStorage.getItem(SESSION_KEY);
const publicMedia = getPublicMediaConfig();
const visibleMediaCount = {
  photos: MEDIA_BATCH_SIZE.photos,
  videos: MEDIA_BATCH_SIZE.videos
};
const activeObjectUrls = {
  photos: [],
  videos: []
};

daysTogether.textContent = `${dayDiff} 天`;

function createId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      return normalizeState(JSON.parse(saved));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return normalizeState({
    photos: [],
    videos: [],
    letters: [
      {
        id: createId(),
        mood: '爱你',
        content: '谢谢你一直陪在我身边，希望以后的每一天都有你。',
        date: '2026.04.26'
      }
    ],
    timeline: [
      { id: createId(), date: '2024.02.14', text: '我们在一起了' },
      { id: createId(), date: '2024.05.20', text: '第一次认真准备惊喜' },
      { id: createId(), date: '2025.02.14', text: '第一个周年纪念日' },
      { id: createId(), date: '2026.04.26', text: '拥有了这个网页' }
    ]
  });
}

function normalizeState(data) {
  return {
    photos: data.photos || [],
    videos: data.videos || [],
    letters: data.letters || [],
    timeline: data.timeline || [],
    deleteStats: data.deleteStats || {},
    deleteRequests: data.deleteRequests || [],
    profiles: data.profiles || {}
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizePublicSrc(src) {
  if (typeof src !== 'string') {
    return '';
  }

  const value = src.trim();
  if (!value) {
    return '';
  }

  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }

  return value.replace(/^\/+/, '');
}

function normalizePublicMediaCollection(items, type) {
  if (!Array.isArray(items)) {
    return [];
  }

  const defaults = type === 'photos'
    ? { title: '公开照片回忆', desc: '这个瞬间已经被放进公开网站。' }
    : { title: '公开视频时光', desc: '这段视频可以在所有设备访问。' };

  return items
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const src = normalizePublicSrc(item.src || item.url || '');
      if (!src) {
        return null;
      }

      return {
        id: item.id || `repo-${type}-${index + 1}`,
        author: item.author || 'admin',
        title: item.title || defaults.title,
        desc: item.desc || defaults.desc,
        date: item.date || '',
        src,
        source: 'repo'
      };
    })
    .filter(Boolean);
}

function getPublicMediaConfig() {
  const config = window[PUBLIC_MEDIA_KEY];
  if (!config || typeof config !== 'object') {
    return {
      photos: [],
      videos: []
    };
  }

  return {
    photos: normalizePublicMediaCollection(config.photos, 'photos'),
    videos: normalizePublicMediaCollection(config.videos, 'videos')
  };
}

function getDisplayMediaItems(type) {
  return [...(publicMedia[type] || []), ...(state[type] || [])];
}

function getBatchSize(type) {
  return MEDIA_BATCH_SIZE[type] || 8;
}

function clearTrackedObjectUrls(type) {
  activeObjectUrls[type].forEach(url => URL.revokeObjectURL(url));
  activeObjectUrls[type] = [];
}

function trackObjectUrl(type, url) {
  if (typeof url === 'string' && url.startsWith('blob:')) {
    activeObjectUrls[type].push(url);
  }
  return url;
}

function updateGalleryFooter(type, total) {
  const isPhoto = type === 'photos';
  const button = isPhoto ? photoLoadMoreBtn : videoLoadMoreBtn;
  const tip = isPhoto ? photoGalleryTip : videoGalleryTip;
  const label = isPhoto ? '照片' : '视频';
  const unit = isPhoto ? '张' : '个';
  const shown = Math.min(visibleMediaCount[type] || getBatchSize(type), total);
  const hasMore = shown < total;

  if (!button || !tip) {
    return;
  }

  button.classList.toggle('hidden', !hasMore);
  button.textContent = `加载更多${label}`;

  if (!total) {
    tip.textContent = '';
    return;
  }

  if (total > getBatchSize(type)) {
    tip.textContent = `已显示 ${shown} / ${total} ${unit}，为避免网页卡顿，内容默认分批加载。`;
    return;
  }

  tip.textContent = `共 ${total} ${unit}。`;
}

function getUserLabel(userKey) {
  if (state.profiles[userKey] && state.profiles[userKey].name) {
    return state.profiles[userKey].name;
  }

  const account = ACCOUNTS[userKey];
  return account ? account.name : '旧数据';
}

function getUserAvatar(userKey) {
  return state.profiles[userKey] ? state.profiles[userKey].avatar : '';
}

function getDefaultAvatarText(userKey) {
  const label = getUserLabel(userKey);
  return label.slice(0, 1);
}

function isRepoMediaItem(item) {
  return item && item.source === 'repo';
}

function canManage(item) {
  return !isRepoMediaItem(item) && currentUser !== 'guest' && (currentUser === 'admin' || !item.author || item.author === currentUser);
}

function isGuest() {
  return currentUser === 'guest';
}

function canEditContent() {
  return currentUser && currentUser !== 'guest';
}

function canDeleteDirectly() {
  return currentUser === 'admin' || (state.deleteStats[currentUser] || 0) < 5;
}

function updateAuthView() {
  syncProfileDisplays();

  if (currentUser) {
    loginScreen.classList.add('hidden');
    appShell.classList.remove('hidden');
    currentUserText.textContent = `当前身份：${getUserLabel(currentUser)}`;
    updateProfileForm();
    adminPanel.classList.toggle('hidden', currentUser !== 'admin');
    adminNavLink.classList.toggle('hidden', currentUser !== 'admin');
    lettersNavLink.classList.toggle('hidden', isGuest());
    profileNavLink.classList.toggle('hidden', isGuest());
    letterForm.classList.toggle('hidden', isGuest());
    document.querySelector('#letters').classList.toggle('hidden', isGuest());
    document.querySelector('#profile').classList.toggle('hidden', isGuest());
    editOnlyElements.forEach(element => element.classList.toggle('hidden', isGuest()));
    renderAll();
    return;
  }

  appShell.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  adminPanel.classList.add('hidden');
  adminNavLink.classList.add('hidden');
  editOnlyElements.forEach(element => element.classList.add('hidden'));
}

function getDateText() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function formatDateInput(value) {
  return value.replace(/-/g, '.');
}

function createButton(text, className, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = text;
  button.addEventListener('click', onClick);
  return button;
}

function createActions(editHandler, deleteHandler) {
  const actions = document.createElement('div');
  actions.className = 'card-actions';
  actions.append(
    createButton('编辑', 'action-btn', editHandler),
    createButton('删除', 'action-btn danger-btn', deleteHandler)
  );
  return actions;
}

function createAuthorBadge(author) {
  const badge = document.createElement('span');
  const avatar = getUserAvatar(author);
  badge.className = 'author-badge';

  if (avatar) {
    const image = document.createElement('img');
    image.className = 'mini-avatar';
    image.src = avatar;
    image.alt = getUserLabel(author);
    badge.append(image);
  }

  badge.append(`来自：${getUserLabel(author)}`);
  return badge;
}

function renderAvatar(container, userKey) {
  if (!container) return;

  const avatar = getUserAvatar(userKey);
  container.innerHTML = '';

  if (avatar) {
    const image = document.createElement('img');
    image.src = avatar;
    image.alt = getUserLabel(userKey);
    container.append(image);
    return;
  }

  container.textContent = getDefaultAvatarText(userKey);
}

function syncProfileDisplays() {
  Object.keys(syncedProfileNodes).forEach(userKey => {
    syncedProfileNodes[userKey].names.forEach(node => {
      if (node) node.textContent = getUserLabel(userKey);
    });

    syncedProfileNodes[userKey].avatars.forEach(node => {
      renderAvatar(node, userKey);
    });
  });

  if (currentUser) {
    currentUserText.textContent = `当前身份：${getUserLabel(currentUser)}`;
  }
}

function updateProfileForm() {
  if (!currentUser || !profileForm) return;

  syncProfileDisplays();
  profileNameInput.value = getUserLabel(currentUser);
  profilePreviewName.textContent = getUserLabel(currentUser);
  renderAvatar(profilePreviewAvatar, currentUser);
}

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

accountCards.forEach(card => {
  card.addEventListener('click', () => {
    accountCards.forEach(item => item.classList.remove('active'));
    card.classList.add('active');
    selectedAccount = card.dataset.account;
    loginError.textContent = '';
    passwordInput.required = selectedAccount !== 'guest';
    passwordInput.placeholder = selectedAccount === 'guest' ? '游客无需密码' : '请输入专属密码';
    passwordInput.value = selectedAccount === 'guest' ? '' : passwordInput.value;
    if (selectedAccount !== 'guest') {
      passwordInput.focus();
    }
  });
});

loginForm.addEventListener('submit', event => {
  event.preventDefault();

  const account = ACCOUNTS[selectedAccount];
  if (!account || (selectedAccount !== 'guest' && passwordInput.value !== account.password)) {
    loginError.textContent = '密码不正确，请重新输入。';
    passwordInput.select();
    return;
  }

  currentUser = selectedAccount;
  localStorage.setItem(SESSION_KEY, currentUser);
  passwordInput.value = '';
  loginError.textContent = '';
  updateAuthView();
});

logoutBtn.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem(SESSION_KEY);
  updateAuthView();
});

function openMediaDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(DB_STORE);
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function saveMedia(id, file) {
  return new Promise((resolve, reject) => {
    const transaction = mediaDb.transaction(DB_STORE, 'readwrite');
    const store = transaction.objectStore(DB_STORE);
    const request = store.put(file, id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function getMedia(id) {
  return new Promise((resolve, reject) => {
    const transaction = mediaDb.transaction(DB_STORE, 'readonly');
    const store = transaction.objectStore(DB_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function removeMedia(id) {
  return new Promise((resolve, reject) => {
    const transaction = mediaDb.transaction(DB_STORE, 'readwrite');
    const store = transaction.objectStore(DB_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getMediaUrl(item) {
  if (item.src) {
    return item.src;
  }

  if (!item.mediaId) {
    return '';
  }

  const file = await getMedia(item.mediaId);
  if (!file) {
    return '';
  }

  return URL.createObjectURL(file);
}

async function renderPhotos() {
  clearTrackedObjectUrls('photos');
  photoGallery.innerHTML = '';

  const photoItems = getDisplayMediaItems('photos');
  const visiblePhotoItems = photoItems.slice(0, visibleMediaCount.photos);
  if (!photoItems.length) {
    photoGallery.innerHTML = '<article class="memory-card placeholder-card"><div class="placeholder-art">📷</div><h3>等待第一张回忆</h3><p>上传你们喜欢的照片，或把仓库里的图片写进 media.config.js，它会展示在这里。</p></article>';
    updateGalleryFooter('photos', 0);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const photo of visiblePhotoItems) {
    const card = document.createElement('article');
    const image = document.createElement('img');
    const body = document.createElement('div');
    const title = document.createElement('h3');
    const date = document.createElement('time');
    const text = document.createElement('p');
    const src = await getMediaUrl(photo);

    card.className = 'memory-card';
    body.className = 'card-body';
    image.src = trackObjectUrl('photos', src);
    image.alt = photo.title;
    image.loading = 'lazy';
    image.decoding = 'async';
    title.textContent = photo.title;
    date.textContent = photo.date;
    text.textContent = photo.desc;

    body.append(title, date, createAuthorBadge(photo.author), text);
    if (canManage(photo)) {
      body.append(createActions(() => updateMemory('photos', photo.id), () => deleteItem('photos', photo.id)));
    }
    card.append(image, body);
    fragment.append(card);
  }

  photoGallery.append(fragment);
  updateGalleryFooter('photos', photoItems.length);
}

async function renderVideos() {
  clearTrackedObjectUrls('videos');
  videoGallery.innerHTML = '';

  const videoItems = getDisplayMediaItems('videos');
  const visibleVideoItems = videoItems.slice(0, visibleMediaCount.videos);
  if (!videoItems.length) {
    videoGallery.innerHTML = '<article class="memory-card placeholder-card"><div class="placeholder-art">🎬</div><h3>等待第一段视频</h3><p>上传视频后可以本地播放，写进 media.config.js 后可以在所有设备访问。</p></article>';
    updateGalleryFooter('videos', 0);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const item of visibleVideoItems) {
    const card = document.createElement('article');
    const video = document.createElement('video');
    const body = document.createElement('div');
    const title = document.createElement('h3');
    const date = document.createElement('time');
    const text = document.createElement('p');
    const src = await getMediaUrl(item);

    card.className = 'memory-card';
    body.className = 'card-body';
    video.src = trackObjectUrl('videos', src);
    video.controls = true;
    video.playsInline = true;
    video.preload = 'none';
    title.textContent = item.title;
    date.textContent = item.date;
    text.textContent = item.desc;

    body.append(title, date, createAuthorBadge(item.author), text);
    if (canManage(item)) {
      body.append(createActions(() => updateMemory('videos', item.id), () => deleteItem('videos', item.id)));
    }
    card.append(video, body);
    fragment.append(card);
  }

  videoGallery.append(fragment);
  updateGalleryFooter('videos', videoItems.length);
}

function renderLetters() {
  lettersList.innerHTML = '';

  state.letters.forEach(letter => {
    const card = document.createElement('article');
    const title = document.createElement('span');
    const content = document.createElement('p');
    const date = document.createElement('time');

    card.className = 'letter-card';
    title.textContent = `To 我的宝贝 · ${letter.mood}`;
    content.textContent = letter.content;
    date.textContent = letter.date;
    card.append(title, createAuthorBadge(letter.author), content, date);
    if (canManage(letter)) {
      card.append(createActions(() => updateLetter(letter.id), () => deleteItem('letters', letter.id)));
    }
    lettersList.append(card);
  });
}

function renderTimeline() {
  timelineList.innerHTML = '';

  state.timeline.forEach(item => {
    const row = document.createElement('div');
    const date = document.createElement('time');
    const text = document.createElement('span');

    row.className = 'timeline-item';
    date.textContent = item.date;
    text.textContent = item.text;
    row.append(date, text);
    if (canManage(item)) {
      row.append(createActions(() => updateTimeline(item.id), () => deleteItem('timeline', item.id)));
    }
    timelineList.append(row);
  });
}

function renderAll() {
  renderPhotos();
  renderVideos();
  renderLetters();
  renderTimeline();
  renderDeleteRequests();
}

function getTypeLabel(type) {
  const labels = {
    photos: '照片',
    videos: '视频',
    letters: '悄悄话',
    timeline: '时间线'
  };
  return labels[type] || '内容';
}

function getItemSummary(type, item) {
  if (!item) return '内容已不存在';
  if (type === 'letters') return item.content.slice(0, 24);
  if (type === 'timeline') return item.text;
  return item.title;
}

function hasPendingDeleteRequest(type, id) {
  return state.deleteRequests.some(request => request.type === type && request.itemId === id && request.status === 'pending');
}

function renderDeleteRequests() {
  if (!deleteRequestList) return;
  deleteRequestList.innerHTML = '';

  const pendingRequests = state.deleteRequests.filter(request => request.status === 'pending');
  if (!pendingRequests.length) {
    deleteRequestList.innerHTML = '<p>暂无待处理的删除申请。</p>';
    return;
  }

  pendingRequests.forEach(request => {
    const card = document.createElement('article');
    const title = document.createElement('strong');
    const detail = document.createElement('p');

    card.className = 'request-card';
    title.textContent = `${getUserLabel(request.requester)} 申请删除${getTypeLabel(request.type)}`;
    detail.textContent = `${request.summary} · ${request.date}`;
    card.append(
      title,
      detail,
      createActions(() => approveDeleteRequest(request.id), () => rejectDeleteRequest(request.id))
    );
    deleteRequestList.append(card);
  });
}

function updateMemory(type, id) {
  const item = state[type].find(entry => entry.id === id);
  if (!item) return;

  const title = prompt('修改标题', item.title);
  if (title === null) return;

  const desc = prompt('修改描述', item.desc);
  if (desc === null) return;

  item.title = title.trim() || item.title;
  item.desc = desc.trim() || item.desc;
  saveState();
  renderAll();
}

function updateLetter(id) {
  const item = state.letters.find(entry => entry.id === id);
  if (!item) return;

  const content = prompt('修改悄悄话', item.content);
  if (content === null) return;

  item.content = content.trim() || item.content;
  saveState();
  renderLetters();
}

function updateTimeline(id) {
  const item = state.timeline.find(entry => entry.id === id);
  if (!item) return;

  const date = prompt('修改日期，例如 2026.04.26', item.date);
  if (date === null) return;

  const text = prompt('修改内容', item.text);
  if (text === null) return;

  item.date = date.trim() || item.date;
  item.text = text.trim() || item.text;
  saveState();
  renderTimeline();
}

async function deleteItem(type, id) {
  const item = state[type].find(entry => entry.id === id);
  if (!item) return;

  if (currentUser !== 'admin' && !canDeleteDirectly()) {
    requestDelete(type, id);
    return;
  }

  if (!confirm('确定删除这条内容吗？')) return;

  await performDelete(type, id);

  if (currentUser !== 'admin') {
    state.deleteStats[currentUser] = (state.deleteStats[currentUser] || 0) + 1;
    saveState();
  }
}

async function performDelete(type, id) {
  const item = state[type].find(entry => entry.id === id);
  if (!item) return;

  if (item.mediaId) {
    await removeMedia(item.mediaId);
  }
  state[type] = state[type].filter(item => item.id !== id);
  state.deleteRequests = state.deleteRequests.filter(request => !(request.type === type && request.itemId === id));
  saveState();
  renderAll();
}

function requestDelete(type, id) {
  const item = state[type].find(entry => entry.id === id);
  if (!item) return;

  if (hasPendingDeleteRequest(type, id)) {
    alert('这条内容已经提交过删除申请，等待管理员处理。');
    return;
  }

  if (!confirm('连续删除已超过 5 个，需要向管理员发起删除申请。是否提交申请？')) return;

  state.deleteRequests.unshift({
    id: createId(),
    type,
    itemId: id,
    requester: currentUser,
    summary: getItemSummary(type, item),
    date: getDateText(),
    status: 'pending'
  });
  saveState();
  renderDeleteRequests();
  alert('删除申请已提交，等待管理员通过。');
}

async function approveDeleteRequest(id) {
  if (currentUser !== 'admin') return;

  const request = state.deleteRequests.find(item => item.id === id);
  if (!request) return;
  if (!confirm('确定通过这条删除申请吗？')) return;

  await performDelete(request.type, request.itemId);
}

function rejectDeleteRequest(id) {
  if (currentUser !== 'admin') return;

  const request = state.deleteRequests.find(item => item.id === id);
  if (!request) return;
  if (!confirm('确定拒绝这条删除申请吗？')) return;

  request.status = 'rejected';
  saveState();
  renderDeleteRequests();
}

async function removeMediaForItems(items) {
  for (const item of items) {
    if (item.mediaId) {
      await removeMedia(item.mediaId);
    }
  }
}

async function bulkDelete(type) {
  if (currentUser !== 'admin') {
    alert('批量删除需要管理员权限。');
    return;
  }

  const labels = {
    photos: '全部照片',
    videos: '全部视频',
    letters: '全部悄悄话',
    timeline: '全部时间线',
    all: '全部数据'
  };

  if (!confirm(`确定要删除${labels[type]}吗？此操作不可恢复。`)) return;

  if (type === 'all') {
    await removeMediaForItems(state.photos);
    await removeMediaForItems(state.videos);
    state.photos = [];
    state.videos = [];
    state.letters = [];
    state.timeline = [];
    state.deleteRequests = [];
  } else {
    if (type === 'photos' || type === 'videos') {
      await removeMediaForItems(state[type]);
    }
    state[type] = [];
    state.deleteRequests = state.deleteRequests.filter(request => request.type !== type);
  }

  saveState();
  renderAll();
}

photoInput.addEventListener('change', async event => {
  if (!canEditContent()) {
    photoInput.value = '';
    alert('游客没有上传权限。');
    return;
  }

  const files = Array.from(event.target.files || []).filter(file => file.type.startsWith('image/'));
  if (!files.length) return;

  for (const file of files) {
    const mediaId = createId();
    await saveMedia(mediaId, file);
    state.photos.unshift({
      id: createId(),
      mediaId,
      author: currentUser,
      title: '新的照片回忆',
      desc: '这一刻，也被我们好好收藏啦。',
      date: getDateText()
    });
  }

  saveState();
  renderPhotos();
  photoInput.value = '';
});

videoInput.addEventListener('change', async event => {
  if (!canEditContent()) {
    videoInput.value = '';
    alert('游客没有上传权限。');
    return;
  }

  const files = Array.from(event.target.files || []).filter(file => file.type.startsWith('video/'));
  if (!files.length) return;

  for (const file of files) {
    const mediaId = createId();
    await saveMedia(mediaId, file);
    state.videos.unshift({
      id: createId(),
      mediaId,
      author: currentUser,
      title: '新的视频时光',
      desc: '有声音、有画面，也有我们。',
      date: getDateText()
    });
  }

  saveState();
  renderVideos();
  videoInput.value = '';
});

moodButtons.forEach(button => {
  button.addEventListener('click', () => {
    moodButtons.forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    selectedMood = button.textContent.trim();
  });
});

letterForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!canEditContent()) {
    alert('游客不能发布悄悄话。');
    return;
  }

  const message = letterText.value.trim();
  if (!message) return;

  state.letters.unshift({
    id: createId(),
    author: currentUser,
    mood: selectedMood,
    content: message,
    date: getDateText()
  });

  saveState();
  renderLetters();
  letterForm.reset();
});

timelineForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!canEditContent()) {
    alert('游客不能添加时间线。');
    return;
  }

  state.timeline.unshift({
    id: createId(),
    author: currentUser,
    date: formatDateInput(timelineDate.value),
    text: timelineText.value.trim()
  });

  saveState();
  renderTimeline();
  timelineForm.reset();
});

profileAvatarInput.addEventListener('change', async event => {
  if (!canEditContent()) {
    profileAvatarInput.value = '';
    alert('游客不能修改资料。');
    return;
  }

  const file = event.target.files && event.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;

  const avatar = await readImageAsDataUrl(file);
  profilePreviewAvatar.innerHTML = '';
  const image = document.createElement('img');
  image.src = avatar;
  image.alt = profileNameInput.value.trim() || getUserLabel(currentUser);
  profilePreviewAvatar.append(image);
});

profileForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!canEditContent()) {
    alert('游客不能修改资料。');
    return;
  }

  const name = profileNameInput.value.trim();
  const file = profileAvatarInput.files && profileAvatarInput.files[0];
  const oldProfile = state.profiles[currentUser] || {};
  const avatar = file && file.type.startsWith('image/') ? await readImageAsDataUrl(file) : oldProfile.avatar;

  state.profiles[currentUser] = {
    name: name || getUserLabel(currentUser),
    avatar: avatar || ''
  };

  saveState();
  profileAvatarInput.value = '';
  currentUserText.textContent = `当前身份：${getUserLabel(currentUser)}`;
  updateProfileForm();
  renderAll();
  alert('资料已保存。');
});

if (photoLoadMoreBtn) {
  photoLoadMoreBtn.addEventListener('click', () => {
    visibleMediaCount.photos += getBatchSize('photos');
    renderPhotos();
  });
}

if (videoLoadMoreBtn) {
  videoLoadMoreBtn.addEventListener('click', () => {
    visibleMediaCount.videos += getBatchSize('videos');
    renderVideos();
  });
}

bulkDeleteButtons.forEach(button => {
  button.addEventListener('click', () => {
    bulkDelete(button.dataset.bulkDelete);
  });
});

async function init() {
  mediaDb = await openMediaDb();
  updateAuthView();
}

init();
