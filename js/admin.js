/**
 * Treat Landing Page - Admin Studio Controller
 * Enables uploading custom mockup images for all 4 phones, editing step titles/descriptions,
 * changing download targets, and exporting/importing JSON backups.
 */

class TreatAdminPanel {
  constructor(screenFlowInstance) {
    this.flow = screenFlowInstance;

    this.storageKey = 'treat_landing_config_v4';

    this.config = this.loadConfig();

    this.activeTab = 'flow'; // 'flow', 'hero', 'downloads', 'backup'
    this.currentUser = null;

    // DOM Elements - Studio Drawer
    this.drawer = document.getElementById('admin-studio-drawer');
    this.backdrop = document.getElementById('admin-studio-backdrop');
    this.openBtn = document.getElementById('admin-open-btn');
    this.closeBtn = document.getElementById('admin-close-btn');
    this.lockBtn = document.getElementById('admin-lock-btn');

    // DOM Elements - Login Modal
    this.loginModal = document.getElementById('admin-login-modal');
    this.loginCard = document.getElementById('admin-login-card');
    this.loginBackdrop = document.getElementById('admin-login-backdrop');
    this.closeLoginBtn = document.getElementById('close-admin-login-btn');
    this.loginForm = document.getElementById('admin-login-form');
    this.emailInput = document.getElementById('admin-email-input');
    this.passInput = document.getElementById('admin-pass-input');
    this.togglePassBtn = document.getElementById('toggle-pass-visibility');
    this.passIcon = document.getElementById('pass-visibility-icon');
    this.loginBtn = document.getElementById('admin-login-submit-btn');
    this.loginBtnText = document.getElementById('admin-drawer-login-text');
    this.loginSpinner = document.getElementById('admin-drawer-login-spinner');
    this.loginLockIcon = document.getElementById('admin-drawer-lock-icon');
    this.googleBtn = document.getElementById('admin-drawer-google-btn');
    this.forgotBtn = document.getElementById('admin-drawer-forgot-btn');
    this.loginError = document.getElementById('admin-login-error');
    this.loginErrorText = document.getElementById('admin-login-error-text');
    this.loginNotice = document.getElementById('admin-login-notice');
    this.loginNoticeText = document.getElementById('admin-login-notice-text');

    this.init();
  }

  loadConfig() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.flowSteps) && parsed.flowSteps.length >= 4) {
          if (!parsed.team && window.TREAT_DEFAULT_DATA && window.TREAT_DEFAULT_DATA.team) {
            parsed.team = JSON.parse(JSON.stringify(window.TREAT_DEFAULT_DATA.team));
            if (parsed.developer) {
              parsed.team[0] = Object.assign({}, parsed.team[0], parsed.developer);
            }
          }
          if (!parsed.developer && parsed.team && parsed.team[0]) {
            parsed.developer = parsed.team[0];
          }
          if (window.TREAT_DEFAULT_DATA && window.TREAT_DEFAULT_DATA.download) {
            parsed.download = Object.assign({}, window.TREAT_DEFAULT_DATA.download, parsed.download || {});
          }
          if (window.TREAT_DEFAULT_DATA && window.TREAT_DEFAULT_DATA.contact) {
            parsed.contact = Object.assign({}, window.TREAT_DEFAULT_DATA.contact, parsed.contact || {});
          }
          if (parsed.contact && parsed.contact.copyrightText && parsed.contact.copyrightText.includes('Funky Foodie Life')) {
            parsed.contact.copyrightText = parsed.contact.copyrightText.replace(/\s*Funky Foodie Life\.?/gi, '').trim();
            try { localStorage.setItem(this.storageKey, JSON.stringify(parsed)); } catch (e) {}
          }
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to load localStorage config:', err);
    }
    return JSON.parse(JSON.stringify(window.TREAT_DEFAULT_DATA));
  }

  saveConfig() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
    this.applyLiveChanges();
  }

  init() {
    this.bindDrawerEvents();
    this.renderTabs();
    this.renderCurrentTab();
    this.applyLiveChanges();

    // Firebase Auth session observer
    const setupAuthObserver = () => {
      if (window.TreatAuth) {
        window.TreatAuth.onAuthStateChanged((user) => {
          this.currentUser = user;
          if (!user && this.isOpen()) {
            this.close();
          }
        });
      } else {
        setTimeout(setupAuthObserver, 60);
      }
    };
    setupAuthObserver();

    // Synchronize changes made in full-page admin.html across browser tabs
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) {
        this.config = this.loadConfig();
        this.applyLiveChanges();
      }
    });
  }

  // --- AUTHENTICATION & SECURITY (FIREBASE) ---

  isAuthenticated() {
    if (window.TreatAuth && typeof window.TreatAuth.isAuthenticated === 'function') {
      return window.TreatAuth.isAuthenticated();
    }
    return !!this.currentUser;
  }

  openLoginModal() {
    if (!this.loginModal) return;
    this.loginModal.classList.remove('hidden');
    this.hideLoginMessages();
    if (this.passInput) {
      this.passInput.value = '';
      this.passInput.type = 'password';
      if (this.passIcon) this.passIcon.textContent = 'visibility';
    }
    if (this.emailInput) {
      setTimeout(() => this.emailInput.focus(), 80);
    }
  }

  closeLoginModal() {
    if (!this.loginModal) return;
    this.loginModal.classList.add('hidden');
    if (this.passInput) this.passInput.value = '';
    this.hideLoginMessages();
  }

  setLoginLoading(loading, loadingText = 'Signing in...') {
    if (!this.loginBtn) return;
    if (loading) {
      this.loginBtn.disabled = true;
      if (this.googleBtn) this.googleBtn.disabled = true;
      if (this.loginSpinner) this.loginSpinner.classList.remove('hidden');
      if (this.loginLockIcon) this.loginLockIcon.classList.add('hidden');
      if (this.loginBtnText) this.loginBtnText.textContent = loadingText;
    } else {
      this.loginBtn.disabled = false;
      if (this.googleBtn) this.googleBtn.disabled = false;
      if (this.loginSpinner) this.loginSpinner.classList.add('hidden');
      if (this.loginLockIcon) this.loginLockIcon.classList.remove('hidden');
      if (this.loginBtnText) this.loginBtnText.textContent = 'Sign In & Unlock';
    }
  }

  showLoginError(msg) {
    if (this.loginNotice) this.loginNotice.classList.add('hidden');
    if (this.loginError) {
      this.loginError.classList.remove('hidden');
      if (this.loginErrorText) this.loginErrorText.textContent = msg;
    }
    if (this.loginCard) {
      this.loginCard.classList.remove('shake-error');
      void this.loginCard.offsetWidth; // trigger reflow
      this.loginCard.classList.add('shake-error');
    }
  }

  showLoginNotice(msg) {
    if (this.loginError) this.loginError.classList.add('hidden');
    if (this.loginNotice) {
      this.loginNotice.classList.remove('hidden');
      if (this.loginNoticeText) this.loginNoticeText.textContent = msg;
    }
  }

  hideLoginMessages() {
    if (this.loginError) this.loginError.classList.add('hidden');
    if (this.loginNotice) this.loginNotice.classList.add('hidden');
  }

  async submitLogin() {
    const email = this.emailInput ? this.emailInput.value.trim() : '';
    const pass = this.passInput ? this.passInput.value : '';

    if (!email) {
      this.showLoginError('Please enter your admin email.');
      if (this.emailInput) this.emailInput.focus();
      return;
    }
    if (!pass) {
      this.showLoginError('Please enter your admin password.');
      if (this.passInput) this.passInput.focus();
      return;
    }

    this.hideLoginMessages();
    this.setLoginLoading(true, 'Verifying...');

    try {
      if (!window.TreatAuth) {
        throw new Error('Firebase Auth is still initializing. Please wait a moment.');
      }
      await window.TreatAuth.loginWithEmail(email, pass);
      this.closeLoginModal();
      this.openDrawer();
      this.showToast('Admin Studio Unlocked');
    } catch (err) {
      this.showLoginError(err.message || 'Access denied. Please check credentials.');
    } finally {
      this.setLoginLoading(false);
    }
  }

  async submitGoogleLogin() {
    this.hideLoginMessages();
    this.setLoginLoading(true, 'Connecting to Google...');

    try {
      if (!window.TreatAuth) {
        throw new Error('Firebase Auth is still initializing.');
      }
      await window.TreatAuth.loginWithGoogle();
      this.closeLoginModal();
      this.openDrawer();
      this.showToast('Admin Studio Unlocked');
    } catch (err) {
      this.showLoginError(err.message || 'Google sign-in failed.');
    } finally {
      this.setLoginLoading(false);
    }
  }

  async handleForgotPassword() {
    const email = this.emailInput ? this.emailInput.value.trim() : '';
    if (!email) {
      this.showLoginError('Enter your admin email above first, then click "Forgot password?".');
      if (this.emailInput) this.emailInput.focus();
      return;
    }

    try {
      if (!window.TreatAuth) {
        throw new Error('Firebase Auth is still initializing.');
      }
      await window.TreatAuth.sendPasswordReset(email);
      this.showLoginNotice(`Reset link sent to ${email}`);
    } catch (err) {
      this.showLoginError(err.message || 'Could not send reset email.');
    }
  }

  togglePasswordVisibility() {
    if (!this.passInput) return;
    if (this.passInput.type === 'password') {
      this.passInput.type = 'text';
      if (this.passIcon) this.passIcon.textContent = 'visibility_off';
    } else {
      this.passInput.type = 'password';
      if (this.passIcon) this.passIcon.textContent = 'visibility';
    }
  }

  async lock() {
    try {
      if (window.TreatAuth) {
        await window.TreatAuth.logout();
      }
    } catch (e) {
      console.error('Logout error:', e);
    }
    this.close();
    this.showToast('Admin Studio Locked');
  }

  showToast(message) {
    let toast = document.getElementById('admin-studio-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'admin-studio-toast';
      toast.className = 'fixed bottom-6 right-6 z-[150] px-4 py-2.5 rounded-full bg-[#181024] text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-white/15 transition-all duration-300 pointer-events-none opacity-0 translate-y-4';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.remove('opacity-0', 'translate-y-4');
    toast.classList.add('opacity-100', 'translate-y-0');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', 'translate-y-4');
    }, 2800);
  }

  bindDrawerEvents() {
    if (this.openBtn) {
      this.openBtn.addEventListener('click', () => this.open());
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.lockBtn) {
      this.lockBtn.addEventListener('click', () => this.lock());
    }

    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }

    // Login modal events
    if (this.closeLoginBtn) {
      this.closeLoginBtn.addEventListener('click', () => this.closeLoginModal());
    }

    if (this.loginBackdrop) {
      this.loginBackdrop.addEventListener('click', () => this.closeLoginModal());
    }

    if (this.loginForm) {
      this.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitLogin();
      });
    }

    if (this.togglePassBtn) {
      this.togglePassBtn.addEventListener('click', () => this.togglePasswordVisibility());
    }

    if (this.googleBtn) {
      this.googleBtn.addEventListener('click', () => this.submitGoogleLogin());
    }

    if (this.forgotBtn) {
      this.forgotBtn.addEventListener('click', () => this.handleForgotPassword());
    }

    // Keyboard shortcut Ctrl+Shift+A / Cmd+Shift+A
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        this.toggle();
      }
      if (e.key === 'Escape') {
        if (this.loginModal && !this.loginModal.classList.contains('hidden')) {
          this.closeLoginModal();
        } else if (this.isOpen()) {
          this.close();
        }
      }
    });
  }

  isOpen() {
    return this.drawer && this.drawer.classList.contains('open');
  }

  open() {
    if (!this.isAuthenticated()) {
      this.openLoginModal();
      return;
    }
    this.openDrawer();
  }

  openDrawer() {
    if (!this.drawer) return;
    this.drawer.classList.add('open');
    if (this.backdrop) this.backdrop.classList.remove('hidden');
    this.renderCurrentTab();
  }

  close() {
    if (!this.drawer) return;
    this.drawer.classList.remove('open');
    if (this.backdrop) this.backdrop.classList.add('hidden');
  }

  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  renderTabs() {
    const tabsContainer = document.getElementById('admin-tabs-nav');
    if (!tabsContainer) return;

    const tabs = [
      { id: 'flow', label: '4 Mockup Phones', icon: 'smartphone' },
      { id: 'hero', label: 'Hero & Vision', icon: 'auto_awesome' },
      { id: 'developer', label: 'Team Profiles', icon: 'group' },
      { id: 'downloads', label: 'App Launch', icon: 'rocket_launch' },
      { id: 'contact', label: 'Support & Social', icon: 'contact_support' },
      { id: 'backup', label: 'Config / JSON', icon: 'save' }
    ];

    tabsContainer.innerHTML = tabs.map(t => `
      <button type="button" class="admin-tab-btn ${this.activeTab === t.id ? 'active' : ''}" data-tab="${t.id}">
        <span class="material-symbols-outlined text-[18px]">${t.icon}</span>
        <span>${t.label}</span>
      </button>
    `).join('');

    tabsContainer.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.getAttribute('data-tab');
        this.renderTabs();
        this.renderCurrentTab();
      });
    });
  }

  renderCurrentTab() {
    const contentArea = document.getElementById('admin-tab-content');
    if (!contentArea) return;

    contentArea.innerHTML = '';

    switch (this.activeTab) {
      case 'flow':
        this.renderFlowTab(contentArea);
        break;
      case 'hero':
        this.renderHeroTab(contentArea);
        break;
      case 'developer':
        this.renderDeveloperTab(contentArea);
        break;
      case 'downloads':
        this.renderDownloadsTab(contentArea);
        break;
      case 'contact':
        this.renderContactTab(contentArea);
        break;
      case 'backup':
        this.renderBackupTab(contentArea);
        break;
    }
  }

  // --- TAB 1: 4 MOCKUP PHONES ---

  renderFlowTab(container) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col gap-5';

    wrapper.innerHTML = `
      <div class="pb-2 border-b border-outline-variant/30">
        <h3 class="font-headline font-bold text-base text-on-surface">4-Phone Wave Showcase</h3>
        <p class="text-xs text-on-surface-variant font-medium">Upload new screenshots, change titles, or pick from wireframes library.</p>
      </div>

      <div id="admin-steps-cards" class="flex flex-col gap-4"></div>
    `;

    container.appendChild(wrapper);

    const cardsContainer = wrapper.querySelector('#admin-steps-cards');

    this.config.flowSteps.slice(0, 4).forEach((step, idx) => {
      const card = document.createElement('div');
      card.className = 'admin-screen-card flex flex-col gap-3';
      card.innerHTML = `
        <div class="flex items-center justify-between pb-1 border-b border-outline-variant/20">
          <div class="flex items-center gap-2">
            <span class="flow-step-badge">0${idx + 1}</span>
            <span class="font-headline font-bold text-sm text-on-surface">Position #${idx + 1}</span>
          </div>
          <span class="text-[11px] font-bold text-secondary uppercase">${step.tag || 'STEP'}</span>
        </div>

        <!-- Image Upload & Preview -->
        <div class="flex items-center gap-3">
          <div class="w-14 h-24 rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant/40 shrink-0 shadow-sm relative">
            <img src="${step.image}" id="admin-preview-img-${idx}" class="w-full h-full object-cover">
          </div>
          <div class="flex-1 min-w-0 flex flex-col gap-1.5">
            <label class="block text-[11px] font-bold text-on-surface">Screenshot Source</label>
            <input type="text" id="admin-step-img-${idx}" value="${step.image}" class="admin-input text-xs" placeholder="Image URL or path">
            <div class="flex items-center gap-2">
              <label class="px-2.5 py-1.5 rounded-lg bg-secondary-fixed hover:bg-secondary hover:text-white text-on-secondary-fixed text-[11px] font-bold cursor-pointer flex items-center gap-1 transition-all">
                <span class="material-symbols-outlined text-[14px]">upload_file</span> Upload
                <input type="file" id="admin-file-${idx}" accept="image/*" class="hidden">
              </label>
              
              <!-- Quick Library Preset Picker -->
              <select id="admin-preset-${idx}" class="admin-input text-[11px] py-1">
                <option value="">Choose wireframe...</option>
                ${(this.config.availableScreens || []).map(scr => `
                  <option value="${scr.image}">${scr.title}</option>
                `).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Title & Icon -->
        <div class="grid grid-cols-3 gap-2">
          <div class="col-span-2">
            <label class="block text-[11px] font-bold text-on-surface mb-0.5">Title</label>
            <input type="text" id="admin-title-${idx}" value="${step.title}" class="admin-input font-bold">
          </div>
          <div>
            <label class="block text-[11px] font-bold text-on-surface mb-0.5">Icon Name</label>
            <input type="text" id="admin-icon-${idx}" value="${step.icon}" class="admin-input">
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-[11px] font-bold text-on-surface mb-0.5">Description (under header)</label>
          <textarea id="admin-desc-${idx}" rows="2" class="admin-input text-xs">${step.description}</textarea>
        </div>
      `;

      // File upload handler
      const fileInput = card.querySelector(`#admin-file-${idx}`);
      const imgInput = card.querySelector(`#admin-step-img-${idx}`);
      const previewImg = card.querySelector(`#admin-preview-img-${idx}`);
      const presetSelect = card.querySelector(`#admin-preset-${idx}`);

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (re) => {
            imgInput.value = re.target.result;
            previewImg.src = re.target.result;
            this.config.flowSteps[idx].image = re.target.result;
            this.saveConfig();
          };
          reader.readAsDataURL(file);
        }
      });

      presetSelect.addEventListener('change', (e) => {
        if (e.target.value) {
          imgInput.value = e.target.value;
          previewImg.src = e.target.value;
          this.config.flowSteps[idx].image = e.target.value;
          this.saveConfig();
        }
      });

      imgInput.addEventListener('input', () => {
        previewImg.src = imgInput.value.trim();
        this.config.flowSteps[idx].image = imgInput.value.trim();
        this.saveConfig();
      });

      card.querySelector(`#admin-title-${idx}`).addEventListener('input', (e) => {
        this.config.flowSteps[idx].title = e.target.value.trim();
        this.saveConfig();
      });

      card.querySelector(`#admin-icon-${idx}`).addEventListener('input', (e) => {
        this.config.flowSteps[idx].icon = e.target.value.trim();
        this.saveConfig();
      });

      card.querySelector(`#admin-desc-${idx}`).addEventListener('input', (e) => {
        this.config.flowSteps[idx].description = e.target.value.trim();
        this.saveConfig();
      });

      cardsContainer.appendChild(card);
    });
  }

  // --- TAB 2: HERO & VISION ---

  renderHeroTab(container) {
    const brand = this.config.brand || {};
    container.innerHTML = `
      <div class="flex flex-col gap-4">
        <div>
          <h3 class="font-headline font-bold text-base text-on-surface">Hero Copy & App Vision</h3>
          <p class="text-xs text-on-surface-variant font-medium">Update the short-form caption and brand headline seen by visitors.</p>
        </div>

        <div>
          <label class="block text-xs font-bold text-on-surface mb-1">Hero Pill Badge</label>
          <input type="text" id="admin-hero-badge" value="${brand.heroBadge || ''}" class="admin-input">
        </div>

        <div>
          <label class="block text-xs font-bold text-on-surface mb-1">Catchy Headline (Lines stacked one under another)</label>
          <textarea id="admin-hero-headline" rows="3" class="admin-input font-bold">${brand.heroHeadline || ''}</textarea>
          <span class="text-[11px] text-on-surface-variant">Default: Find Treat, Give Treat, Get Treat (each on its own line).</span>
        </div>

        <div>
          <label class="block text-xs font-bold text-on-surface mb-1">Eye-Catching Short-Form Caption (Vision)</label>
          <textarea id="admin-hero-caption" rows="4" class="admin-input">${brand.heroCaption || ''}</textarea>
          <span class="text-[11px] text-on-surface-variant">Keep it punchy (1-2 sentences) highlighting group deals, budget matching, and live table hold.</span>
        </div>

        <div class="pt-2">
          <button id="admin-save-hero-btn" class="w-full py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">save</span>
            <span>Update Hero & Vision</span>
          </button>
        </div>
      </div>
    `;

    container.querySelector('#admin-save-hero-btn').addEventListener('click', () => {
      this.config.brand.heroBadge = container.querySelector('#admin-hero-badge').value.trim();
      this.config.brand.heroHeadline = container.querySelector('#admin-hero-headline').value.trim();
      this.config.brand.heroCaption = container.querySelector('#admin-hero-caption').value.trim();
      this.saveConfig();
      this.showToast('Hero copy updated successfully');
    });
  }

  // --- TAB 3: APP LAUNCH & DOWNLOADS ---

  renderDownloadsTab(container) {
    if (!this.config.download) {
      this.config.download = (window.TREAT_DEFAULT_DATA && window.TREAT_DEFAULT_DATA.download)
        ? JSON.parse(JSON.stringify(window.TREAT_DEFAULT_DATA.download))
        : { mode: 'coming_soon' };
    }
    const dl = this.config.download;
    if (!dl.mode) dl.mode = 'coming_soon';

    let waitlist = [];
    try {
      waitlist = JSON.parse(localStorage.getItem('treat_waitlist_subscribers') || '[]');
    } catch (e) {
      waitlist = [];
    }

    container.innerHTML = `
      <div class="flex flex-col gap-4">
        <div class="pb-2 border-b border-outline-variant/30 flex items-center justify-between">
          <div>
            <h3 class="font-headline font-bold text-base text-on-surface">App Launch & Downloads</h3>
            <p class="text-xs text-on-surface-variant font-medium">Control what happens when visitors click download across the landing page.</p>
          </div>
          <button id="admin-preview-banner-btn" class="px-3 py-1 rounded-full bg-purple-100 hover:bg-purple-200 text-[#7C52AA] text-[11px] font-extrabold flex items-center gap-1 active:scale-95 transition-all">
            <span class="material-symbols-outlined text-[15px]">visibility</span>
            <span>Test Banner</span>
          </button>
        </div>

        <!-- 1. Active Mode Selector -->
        <div>
          <label class="block text-xs font-bold text-on-surface mb-1.5">Active Download Mode</label>
          <div class="grid grid-cols-2 gap-2" id="admin-mode-selector">
            <button type="button" class="drawer-mode-btn p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${dl.mode === 'coming_soon' ? 'border-[#E040A0] bg-pink-50/60 font-bold text-[#E040A0]' : 'border-outline-variant/30 bg-surface-container/50 text-on-surface'}" data-mode="coming_soon">
              <span class="material-symbols-outlined text-[18px]">rocket_launch</span>
              <div class="flex flex-col">
                <span class="text-xs leading-tight">Pre-Launch Banner</span>
                <span class="text-[9px] text-gray-400 font-normal">Waitlist & ৳200 voucher</span>
              </div>
            </button>
            <button type="button" class="drawer-mode-btn p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${dl.mode === 'play_store' ? 'border-[#E040A0] bg-pink-50/60 font-bold text-[#E040A0]' : 'border-outline-variant/30 bg-surface-container/50 text-on-surface'}" data-mode="play_store">
              <span class="material-symbols-outlined text-[18px]">shop</span>
              <div class="flex flex-col">
                <span class="text-xs leading-tight">Google Play Direct</span>
                <span class="text-[9px] text-gray-400 font-normal">Redirect to Play Store</span>
              </div>
            </button>
            <button type="button" class="drawer-mode-btn p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${dl.mode === 'direct_apk' ? 'border-[#E040A0] bg-pink-50/60 font-bold text-[#E040A0]' : 'border-outline-variant/30 bg-surface-container/50 text-on-surface'}" data-mode="direct_apk">
              <span class="material-symbols-outlined text-[18px]">android</span>
              <div class="flex flex-col">
                <span class="text-xs leading-tight">Direct APK</span>
                <span class="text-[9px] text-gray-400 font-normal">Download .apk file</span>
              </div>
            </button>
            <button type="button" class="drawer-mode-btn p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${dl.mode === 'store_and_apk' ? 'border-[#E040A0] bg-pink-50/60 font-bold text-[#E040A0]' : 'border-outline-variant/30 bg-surface-container/50 text-on-surface'}" data-mode="store_and_apk">
              <span class="material-symbols-outlined text-[18px]">hub</span>
              <div class="flex flex-col">
                <span class="text-xs leading-tight">Dual Option</span>
                <span class="text-[9px] text-gray-400 font-normal">Play Store + APK Modal</span>
              </div>
            </button>
          </div>
        </div>

        <!-- 2. Pre-Launch Banner Settings -->
        <div class="p-3 rounded-2xl bg-surface-container/40 border border-outline-variant/30 flex flex-col gap-2.5">
          <span class="text-xs font-bold text-[#7C52AA] flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">campaign</span>
            <span>Pre-Launch Banner Copy</span>
          </span>

          <div>
            <label class="block text-[11px] font-bold text-on-surface mb-1">Banner Badge Text</label>
            <input type="text" id="admin-modal-badge" value="${dl.modalBadge || 'PRE-LAUNCH EXCLUSIVE • VIP EARLY ACCESS'}" class="admin-input text-xs">
          </div>

          <div>
            <label class="block text-[11px] font-bold text-on-surface mb-1">Modal Headline</label>
            <input type="text" id="admin-modal-title" value="${dl.modalTitle || 'Treat is Almost Ready to Feast!'}" class="admin-input font-bold text-xs">
          </div>

          <div>
            <label class="block text-[11px] font-bold text-on-surface mb-1">Modal Pitch / Subtitle</label>
            <textarea id="admin-modal-subtitle" rows="3" class="admin-input text-xs">${dl.modalSubtitle || "We're putting the final touches on real-time platter sync, smart budget matching, and 2-minute table holds. Join our VIP early access list to get notified the second we launch — plus an exclusive ৳200 dining voucher on launch day!"}</textarea>
          </div>

          <div class="grid grid-cols-3 gap-1.5 pt-1">
            <div>
              <label class="block text-[10px] font-bold text-gray-500 mb-0.5">Play Store</label>
              <input type="text" id="admin-play-status" value="${dl.playStoreStatus || 'In Review'}" class="admin-input text-[11px] px-2 py-1">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 mb-0.5">iOS Store</label>
              <input type="text" id="admin-app-status" value="${dl.appStoreStatus || 'In Progress'}" class="admin-input text-[11px] px-2 py-1">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 mb-0.5">Kitchen Sync</label>
              <input type="text" id="admin-apk-status" value="${dl.apkStatus || '100% Ready'}" class="admin-input text-[11px] px-2 py-1">
            </div>
          </div>
        </div>

        <!-- 3. Production Links & APK -->
        <div class="p-3 rounded-2xl bg-surface-container/40 border border-outline-variant/30 flex flex-col gap-2.5">
          <span class="text-xs font-bold text-[#7C52AA] flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">link</span>
            <span>Live URLs & Package Targets</span>
          </span>

          <div>
            <label class="block text-[11px] font-bold text-on-surface mb-1">Google Play URL</label>
            <input type="text" id="admin-dl-playstore" value="${dl.playStoreUrl || ''}" placeholder="https://play.google.com/store/apps/details?id=com.treat.app" class="admin-input text-xs">
          </div>

          <div>
            <label class="block text-[11px] font-bold text-on-surface mb-1">Android APK Download Target</label>
            <input type="text" id="admin-dl-apk-url" value="${dl.apkDownloadUrl || 'assets/downloads/Treat-v1.0.4-release.apk'}" placeholder="URL or path to .apk" class="admin-input text-xs">
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[11px] font-bold text-on-surface mb-1">Version Number</label>
              <input type="text" id="admin-dl-version" value="${dl.apkVersion || 'v1.0.4 (Android 9.0+)'}" class="admin-input text-xs">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-on-surface mb-1">Package Size</label>
              <input type="text" id="admin-dl-size" value="${dl.apkSize || '24.8 MB'}" class="admin-input text-xs">
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-on-surface mb-1">Button Label (Landing Page)</label>
            <input type="text" id="admin-cta-text" value="${dl.ctaText || 'Download Treat for Android'}" class="admin-input font-bold text-xs">
          </div>

          <div>
            <label class="block text-[11px] font-bold text-on-surface mb-1">Subtitle / Squad Callout</label>
            <textarea id="admin-cta-subtext" rows="2" class="admin-input text-xs">${dl.ctaSubtext || 'Your next great meal is already waiting.'}</textarea>
          </div>
        </div>

        <!-- 4. VIP Waitlist Hub -->
        <div class="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">groups</span>
            <div>
              <span class="text-xs font-bold text-dark block">VIP Waitlist</span>
              <span class="text-[11px] text-gray-500 font-medium">${waitlist.length} subscribers registered</span>
            </div>
          </div>
          <button type="button" id="admin-export-waitlist-btn" class="px-3 py-1.5 rounded-full bg-dark hover:bg-dark-card text-white text-[10.5px] font-bold flex items-center gap-1 active:scale-95 transition-all">
            <span class="material-symbols-outlined text-[14px]">file_download</span>
            <span>Export CSV</span>
          </button>
        </div>

        <!-- Save Button -->
        <div class="pt-1">
          <button id="admin-save-downloads-btn" class="w-full py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">save</span>
            <span>Update Launch & Download Settings</span>
          </button>
        </div>
      </div>
    `;

    // Mode Selector buttons
    container.querySelectorAll('.drawer-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        this.config.download.mode = mode;
        container.querySelectorAll('.drawer-mode-btn').forEach(b => {
          const isSel = b.getAttribute('data-mode') === mode;
          b.className = `drawer-mode-btn p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${isSel ? 'border-[#E040A0] bg-pink-50/60 font-bold text-[#E040A0]' : 'border-outline-variant/30 bg-surface-container/50 text-on-surface'}`;
        });
        this.saveConfig();
        this.showToast(`Mode switched to: ${mode}`);
      });
    });

    // Preview Banner
    container.querySelector('#admin-preview-banner-btn').addEventListener('click', () => {
      if (window.openDownloadModal) {
        window.openDownloadModal();
      } else {
        const m = document.getElementById('app-download-modal');
        if (m) m.classList.remove('hidden');
      }
    });

    // Export Waitlist
    container.querySelector('#admin-export-waitlist-btn').addEventListener('click', () => {
      let list = [];
      try { list = JSON.parse(localStorage.getItem('treat_waitlist_subscribers') || '[]'); } catch(e){}
      if (list.length === 0) {
        this.showToast('No waitlist subscribers yet');
        return;
      }
      let csv = 'Index,Contact,Registration Date,Incentive\n';
      list.forEach((sub, i) => {
        csv += `${i + 1},"${(sub.contact || '').replace(/"/g, '""')}","${sub.date || ''}","৳200 Launch Voucher"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'treat-vip-waitlist.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      this.showToast('VIP waitlist exported to CSV');
    });

    // Save All
    container.querySelector('#admin-save-downloads-btn').addEventListener('click', () => {
      this.config.download.ctaText = container.querySelector('#admin-cta-text').value.trim();
      this.config.download.ctaSubtext = container.querySelector('#admin-cta-subtext').value.trim();
      this.config.download.apkDownloadUrl = container.querySelector('#admin-dl-apk-url').value.trim();
      this.config.download.apkVersion = container.querySelector('#admin-dl-version').value.trim();
      this.config.download.apkSize = container.querySelector('#admin-dl-size').value.trim();
      this.config.download.playStoreUrl = container.querySelector('#admin-dl-playstore').value.trim();
      this.config.download.modalBadge = container.querySelector('#admin-modal-badge').value.trim();
      this.config.download.modalTitle = container.querySelector('#admin-modal-title').value.trim();
      this.config.download.modalSubtitle = container.querySelector('#admin-modal-subtitle').value.trim();
      this.config.download.playStoreStatus = container.querySelector('#admin-play-status').value.trim();
      this.config.download.appStoreStatus = container.querySelector('#admin-app-status').value.trim();
      this.config.download.apkStatus = container.querySelector('#admin-apk-status').value.trim();

      this.saveConfig();
      this.showToast('Launch settings updated successfully');
    });
  }

  // --- TAB: TEAM PROFILES (3 MEMBERS) ---

  renderDeveloperTab(container) {
    if (!this.config.team || !Array.isArray(this.config.team) || this.config.team.length < 3) {
      this.config.team = (window.TREAT_DEFAULT_DATA && Array.isArray(window.TREAT_DEFAULT_DATA.team))
        ? JSON.parse(JSON.stringify(window.TREAT_DEFAULT_DATA.team))
        : [
            {
              id: 'member-1',
              name: (this.config.developer && this.config.developer.name) || 'Eftakhar Amin Sakib',
              role: (this.config.developer && this.config.developer.role) || 'Lead Full-Stack & Mobile Engineer',
              bio: (this.config.developer && this.config.developer.bio) || 'Architecting real-time mobile sync, interactive 3D UI, and clean cross-platform infrastructure.',
              avatar: (this.config.developer && this.config.developer.avatar) || 'https://github.com/EFTAKHAR-AMIN-SAKIB.png',
              portfolioUrl: (this.config.developer && this.config.developer.portfolioUrl) || 'https://github.com/EFTAKHAR-AMIN-SAKIB',
              githubUrl: (this.config.developer && this.config.developer.githubUrl) || 'https://github.com/EFTAKHAR-AMIN-SAKIB',
              linkedinUrl: 'https://www.linkedin.com/in/eftakhar-amin-sakib/'
            },
            {
              id: 'member-2',
              name: 'Ayesha Rahman',
              role: 'Product & UI/UX Designer',
              bio: 'Crafting playful human-centered foodie flows, squad budgeting systems, and delightful visual design.',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
              portfolioUrl: 'https://dribbble.com',
              githubUrl: 'https://github.com',
              linkedinUrl: 'https://linkedin.com'
            },
            {
              id: 'member-3',
              name: 'Tanvir Ahmed',
              role: 'Backend & Systems Engineer',
              bio: 'Building low-latency restaurant kitchen sync, instantaneous 2-minute table locks, and resilient APIs.',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
              portfolioUrl: 'https://github.com',
              githubUrl: 'https://github.com',
              linkedinUrl: 'https://linkedin.com'
            }
          ];
    }

    let activeIdx = 0;
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col gap-4';

    const renderForm = () => {
      const member = this.config.team[activeIdx] || this.config.team[0];

      wrapper.innerHTML = `
        <div class="pb-2 border-b border-outline-variant/30">
          <div class="flex items-center justify-between">
            <h3 class="font-headline font-bold text-base text-on-surface">Team Profiles</h3>
            <span class="px-2 py-0.5 rounded-full bg-purple-100 text-[#7C52AA] text-[10px] font-extrabold">3 Creators</span>
          </div>
          <p class="text-xs text-on-surface-variant font-medium mt-0.5">Customize the 3 profiles building Treat (Photo, Name, Bio, Links).</p>
        </div>

        <!-- Member Selector Buttons -->
        <div class="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl">
          ${this.config.team.map((m, idx) => `
            <button type="button" class="drawer-team-tab flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all truncate text-center ${activeIdx === idx ? 'bg-white text-primary shadow-xs font-black' : 'text-on-surface-variant hover:text-on-surface'}" data-tab-idx="${idx}">
              ${m.name ? m.name.split(' ')[0] : `Member ${idx + 1}`}
            </button>
          `).join('')}
        </div>

        <div class="flex flex-col gap-3">
          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">Full Name</label>
            <input type="text" id="admin-member-name" value="${member.name || ''}" class="admin-input" placeholder="Name">
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">Role / Job Title</label>
            <input type="text" id="admin-member-role" value="${member.role || ''}" class="admin-input" placeholder="Role">
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">Basic Info / Short Bio</label>
            <textarea id="admin-member-bio" rows="2" class="admin-input text-xs font-medium" placeholder="1-2 sentences about what they build at Treat...">${member.bio || ''}</textarea>
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">Avatar Image URL or Upload</label>
            <div class="flex items-center gap-1.5">
              <input type="text" id="admin-member-avatar" value="${member.avatar || ''}" class="admin-input text-xs flex-1" placeholder="Image URL">
              <label class="px-2.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7C52AA] border border-purple-200 text-xs font-bold cursor-pointer shrink-0 transition-all flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px]">upload</span>
                <input type="file" id="admin-member-avatar-file" class="hidden" accept="image/*">
              </label>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">Portfolio Website URL</label>
            <input type="text" id="admin-member-portfolio" value="${member.portfolioUrl || ''}" class="admin-input text-xs" placeholder="https://portfolio.com">
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">GitHub Profile URL</label>
            <input type="text" id="admin-member-github" value="${member.githubUrl || ''}" class="admin-input text-xs" placeholder="https://github.com/username">
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">LinkedIn Profile URL</label>
            <input type="text" id="admin-member-linkedin" value="${member.linkedinUrl || ''}" class="admin-input text-xs" placeholder="https://linkedin.com/in/username">
          </div>

          <button type="button" id="admin-save-team-btn" class="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-extrabold shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mt-2">
            <span class="material-symbols-outlined text-[16px]">save</span>
            <span>Save Profile (#0${activeIdx + 1})</span>
          </button>
        </div>
      `;

      wrapper.querySelectorAll('.drawer-team-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          const newIdx = parseInt(btn.getAttribute('data-tab-idx'), 10);
          if (!isNaN(newIdx) && newIdx !== activeIdx) {
            activeIdx = newIdx;
            renderForm();
          }
        });
      });

      const nameInput = wrapper.querySelector('#admin-member-name');
      const roleInput = wrapper.querySelector('#admin-member-role');
      const bioInput = wrapper.querySelector('#admin-member-bio');
      const avatarInput = wrapper.querySelector('#admin-member-avatar');
      const avatarFileInput = wrapper.querySelector('#admin-member-avatar-file');
      const portfolioInput = wrapper.querySelector('#admin-member-portfolio');
      const githubInput = wrapper.querySelector('#admin-member-github');
      const linkedinInput = wrapper.querySelector('#admin-member-linkedin');

      if (avatarFileInput) {
        avatarFileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              avatarInput.value = ev.target.result;
              saveMemberData();
              this.showToast(`Uploaded photo for ${this.config.team[activeIdx].name || 'Member'}`);
            };
            reader.readAsDataURL(file);
          }
        });
      }

      const saveMemberData = () => {
        if (!this.config.team[activeIdx]) this.config.team[activeIdx] = {};
        this.config.team[activeIdx].name = nameInput.value.trim();
        this.config.team[activeIdx].role = roleInput.value.trim();
        this.config.team[activeIdx].bio = bioInput.value.trim();
        this.config.team[activeIdx].avatar = avatarInput.value.trim();
        this.config.team[activeIdx].portfolioUrl = portfolioInput.value.trim();
        this.config.team[activeIdx].githubUrl = githubInput.value.trim();
        this.config.team[activeIdx].linkedinUrl = linkedinInput.value.trim();

        if (activeIdx === 0) {
          this.config.developer = Object.assign({}, this.config.developer || {}, this.config.team[0]);
        }

        this.saveConfig();
        this.applyLiveChanges();
      };

      wrapper.querySelector('#admin-save-team-btn').addEventListener('click', () => {
        saveMemberData();
        this.showToast(`Member #0${activeIdx + 1} profile updated`);
      });
    };

    renderForm();
    container.appendChild(wrapper);
  }

  // --- TAB 4: APP LAUNCH & DOWNLOAD MANAGER ---

  renderDownloadsTab(container) {
    if (!this.config.download) {
      this.config.download = (window.TREAT_DEFAULT_DATA && window.TREAT_DEFAULT_DATA.download)
        ? JSON.parse(JSON.stringify(window.TREAT_DEFAULT_DATA.download))
        : { mode: 'coming_soon' };
    }
    const dl = this.config.download;
    if (!dl.mode) dl.mode = 'coming_soon';
    if (dl.progressPercent === undefined || dl.progressPercent === null) dl.progressPercent = 85;
    if (!dl.progressLabel) dl.progressLabel = 'Launch Readiness';
    if (!dl.progressSublabel) dl.progressSublabel = 'Private Beta & Kitchen Floor Sync';
    if (!dl.modalBadge) dl.modalBadge = 'DROPPING SOON • PRIVATE PREVIEW';
    if (!dl.modalTitle) dl.modalTitle = 'Something delicious is in the works.';
    if (!dl.modalSubtitle) dl.modalSubtitle = "We're quietly perfecting a whole new way to feast with your squad. Drop your contact below to get an invite before doors open to the public.";
    if (!dl.modalNotifyBtnText) dl.modalNotifyBtnText = 'Request Early Invite ✨';
    if (!dl.modalSuccessMsg) dl.modalSuccessMsg = "You're on the invite list! Keep an eye on your inbox.";
    if (!dl.modalFooterNote) dl.modalFooterNote = 'Invite-only initial batch. No spam, just first access.';

    let waitlist = [];
    try {
      waitlist = JSON.parse(localStorage.getItem('treat_waitlist_subscribers') || '[]');
    } catch (e) {
      waitlist = [];
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col gap-5';

    wrapper.innerHTML = `
      <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-headline font-bold text-base text-on-surface">App Launch & Download</h3>
            <span id="drawer-active-mode-badge" class="px-2 py-0.5 rounded-full bg-pink-100 text-primary text-[10px] font-black uppercase">
              ${dl.mode === 'coming_soon' ? 'Pre-Launch Active' : dl.mode === 'play_store' ? 'Google Play Live' : dl.mode === 'direct_apk' ? 'Direct APK' : 'Dual Mode'}
            </span>
          </div>
          <p class="text-xs text-on-surface-variant font-medium">Control curiosity modal, progress bar percentage, early invites, and app store status.</p>
        </div>
        <button type="button" id="drawer-preview-modal-btn" class="px-3 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 text-primary border border-pink-200 text-xs font-bold flex items-center gap-1 transition-all">
          <span class="material-symbols-outlined text-[15px]">visibility</span>
          <span>Preview</span>
        </button>
      </div>

      <!-- Mode Selector -->
      <div class="flex flex-col gap-2">
        <label class="block text-xs font-bold text-on-surface">Visitor Download Mode</label>
        <div class="grid grid-cols-2 gap-2" id="drawer-mode-grid">
          <div class="drawer-mode-pill cursor-pointer p-2.5 rounded-xl border transition-all flex flex-col gap-1 ${dl.mode === 'coming_soon' ? 'border-primary bg-pink-50/50 shadow-xs' : 'border-outline-variant/40 bg-surface-container-low hover:border-outline-variant'}" data-mode="coming_soon">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-primary">campaign</span> Pre-Launch
              </span>
              <span class="w-2 h-2 rounded-full ${dl.mode === 'coming_soon' ? 'bg-primary' : 'bg-transparent'}"></span>
            </div>
            <p class="text-[10.5px] text-on-surface-variant font-medium">Curious popup + Progress bar</p>
          </div>

          <div class="drawer-mode-pill cursor-pointer p-2.5 rounded-xl border transition-all flex flex-col gap-1 ${dl.mode === 'play_store' ? 'border-primary bg-pink-50/50 shadow-xs' : 'border-outline-variant/40 bg-surface-container-low hover:border-outline-variant'}" data-mode="play_store">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-emerald-600">shop</span> Play Store
              </span>
              <span class="w-2 h-2 rounded-full ${dl.mode === 'play_store' ? 'bg-primary' : 'bg-transparent'}"></span>
            </div>
            <p class="text-[10.5px] text-on-surface-variant font-medium">Redirect to Google Play</p>
          </div>

          <div class="drawer-mode-pill cursor-pointer p-2.5 rounded-xl border transition-all flex flex-col gap-1 ${dl.mode === 'direct_apk' ? 'border-primary bg-pink-50/50 shadow-xs' : 'border-outline-variant/40 bg-surface-container-low hover:border-outline-variant'}" data-mode="direct_apk">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-blue-600">android</span> Direct APK
              </span>
              <span class="w-2 h-2 rounded-full ${dl.mode === 'direct_apk' ? 'bg-primary' : 'bg-transparent'}"></span>
            </div>
            <p class="text-[10.5px] text-on-surface-variant font-medium">Instant file download</p>
          </div>

          <div class="drawer-mode-pill cursor-pointer p-2.5 rounded-xl border transition-all flex flex-col gap-1 ${dl.mode === 'store_and_apk' ? 'border-primary bg-pink-50/50 shadow-xs' : 'border-outline-variant/40 bg-surface-container-low hover:border-outline-variant'}" data-mode="store_and_apk">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-purple-600">hub</span> Dual Mode
              </span>
              <span class="w-2 h-2 rounded-full ${dl.mode === 'store_and_apk' ? 'bg-primary' : 'bg-transparent'}"></span>
            </div>
            <p class="text-[10.5px] text-on-surface-variant font-medium">Store link + Direct APK</p>
          </div>
        </div>
      </div>

      <!-- Launch Progress Bar Controls (Centerpiece) -->
      <div class="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-primary">timelapse</span>
            <span class="text-xs font-black text-on-surface uppercase tracking-wider">Launch Progress Bar</span>
          </div>
          <span id="drawer-progress-badge" class="px-2.5 py-0.5 rounded-full bg-white border border-pink-200 text-primary font-black text-xs shadow-2xs">
            ${dl.progressPercent}%
          </span>
        </div>

        <div>
          <div class="flex items-center justify-between text-[11px] font-bold text-on-surface-variant mb-1">
            <span>Readiness Percentage</span>
            <span id="drawer-progress-val-text" class="font-mono text-primary font-black">${dl.progressPercent}%</span>
          </div>
          <div class="flex items-center gap-3">
            <input type="range" id="drawer-progress-range" min="0" max="100" step="1" value="${dl.progressPercent}" class="flex-1 accent-[#E040A0] cursor-pointer">
            <input type="number" id="drawer-progress-num" min="0" max="100" step="1" value="${dl.progressPercent}" class="w-16 admin-input text-center text-xs font-black py-1">
          </div>
        </div>

        <!-- Live Visual Bar Preview -->
        <div class="w-full h-2.5 bg-purple-100 rounded-full overflow-hidden p-0.5">
          <div id="drawer-progress-live-fill" class="h-full rounded-full bg-gradient-to-r from-[#E040A0] via-[#9357E8] to-[#2563EB] transition-all duration-300" style="width: ${dl.progressPercent}%;"></div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label class="block text-[11px] font-bold text-on-surface mb-1">Progress Title</label>
            <input type="text" id="drawer-progress-label" value="${dl.progressLabel}" class="admin-input text-xs" placeholder="Launch Readiness">
          </div>
          <div>
            <label class="block text-[11px] font-bold text-on-surface mb-1">Phase Sublabel</label>
            <input type="text" id="drawer-progress-sublabel" value="${dl.progressSublabel}" class="admin-input text-xs" placeholder="Private Beta & Kitchen Floor Sync">
          </div>
        </div>
      </div>

      <!-- Pre-Launch Curiosity Copy Controls -->
      <div class="flex flex-col gap-3">
        <div>
          <label class="block text-xs font-bold text-on-surface mb-1">Pill Badge Text</label>
          <input type="text" id="drawer-modal-badge" value="${dl.modalBadge}" class="admin-input text-xs">
        </div>

        <div>
          <label class="block text-xs font-bold text-on-surface mb-1">Headline (Curious & Exclusive)</label>
          <input type="text" id="drawer-modal-title" value="${dl.modalTitle}" class="admin-input font-bold text-sm">
        </div>

        <div>
          <label class="block text-xs font-bold text-on-surface mb-1">Story / Subtitle</label>
          <textarea id="drawer-modal-subtitle" rows="3" class="admin-input text-xs leading-relaxed">${dl.modalSubtitle}</textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label class="block text-[11px] font-bold text-on-surface mb-1">Invite Button Text</label>
            <input type="text" id="drawer-modal-btn-text" value="${dl.modalNotifyBtnText}" class="admin-input text-xs font-bold">
          </div>
          <div>
            <label class="block text-[11px] font-bold text-on-surface mb-1">Footer Note</label>
            <input type="text" id="drawer-modal-footer-note" value="${dl.modalFooterNote}" class="admin-input text-xs">
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-on-surface mb-1">Success Message</label>
          <input type="text" id="drawer-modal-success-msg" value="${dl.modalSuccessMsg}" class="admin-input text-xs">
        </div>
      </div>

      <!-- Play Store & Direct APK Links -->
      <div class="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
        <h4 class="text-xs font-bold text-on-surface flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px] text-primary">link</span> App Store & APK URLs
        </h4>
        <div>
          <label class="block text-[11px] font-bold text-on-surface mb-1">Google Play Store URL</label>
          <input type="text" id="drawer-play-url" value="${dl.playStoreUrl || ''}" class="admin-input text-xs" placeholder="https://play.google.com/store/apps/details?id=com.treat.app">
        </div>
        <div>
          <label class="block text-[11px] font-bold text-on-surface mb-1">Direct APK Download URL</label>
          <input type="text" id="drawer-apk-url" value="${dl.apkDownloadUrl || ''}" class="admin-input text-xs" placeholder="https://example.com/Treat.apk">
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[11px] font-bold text-on-surface mb-1">APK File Name</label>
            <input type="text" id="drawer-apk-filename" value="${dl.apkFileName || 'Treat.apk'}" class="admin-input text-xs">
          </div>
          <div>
            <label class="block text-[11px] font-bold text-on-surface mb-1">APK File Size</label>
            <input type="text" id="drawer-apk-size" value="${dl.apkSize || '24.8 MB'}" class="admin-input text-xs">
          </div>
        </div>
      </div>

      <!-- Waitlist Count & Quick Export -->
      <div class="p-3 rounded-2xl bg-surface-container border border-outline-variant/30 flex items-center justify-between">
        <div>
          <span class="text-xs font-black text-on-surface flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px] text-secondary">mark_email_read</span>
            <span id="drawer-waitlist-count">${waitlist.length}</span> Early Invite Requests
          </span>
          <p class="text-[10.5px] text-on-surface-variant font-medium">Collected via landing page pre-launch modal.</p>
        </div>
        <button type="button" id="drawer-export-waitlist-btn" class="px-3 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary hover:text-white text-xs font-bold flex items-center gap-1 transition-all">
          <span class="material-symbols-outlined text-[15px]">file_download</span>
          <span>Export CSV</span>
        </button>
      </div>

      <!-- Save Button -->
      <button type="button" id="drawer-save-dl-btn" class="w-full py-3 rounded-xl bg-primary text-white text-xs font-extrabold shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mt-1">
        <span class="material-symbols-outlined text-[16px]">save</span>
        <span>Save App Launch Settings</span>
      </button>
    `;

    container.appendChild(wrapper);

    // Event Listeners for Mode Selection
    const modeBadges = {
      coming_soon: 'Pre-Launch Active',
      play_store: 'Google Play Live',
      direct_apk: 'Direct APK',
      store_and_apk: 'Dual Mode'
    };

    wrapper.querySelectorAll('.drawer-mode-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const selectedMode = pill.getAttribute('data-mode');
        dl.mode = selectedMode;
        wrapper.querySelectorAll('.drawer-mode-pill').forEach(p => {
          const isSelected = p.getAttribute('data-mode') === selectedMode;
          p.className = `drawer-mode-pill cursor-pointer p-2.5 rounded-xl border transition-all flex flex-col gap-1 ${isSelected ? 'border-primary bg-pink-50/50 shadow-xs' : 'border-outline-variant/40 bg-surface-container-low hover:border-outline-variant'}`;
          const dot = p.querySelector('.rounded-full');
          if (dot) dot.className = `w-2 h-2 rounded-full ${isSelected ? 'bg-primary' : 'bg-transparent'}`;
        });
        const badgeEl = wrapper.querySelector('#drawer-active-mode-badge');
        if (badgeEl) badgeEl.textContent = modeBadges[selectedMode] || selectedMode;
        this.saveConfig();
        this.applyLiveChanges();
        this.showToast(`Switched mode to: ${modeBadges[selectedMode]}`);
      });
    });

    // Event Listeners for Progress Slider & Number Input
    const pRange = wrapper.querySelector('#drawer-progress-range');
    const pNum = wrapper.querySelector('#drawer-progress-num');
    const pValText = wrapper.querySelector('#drawer-progress-val-text');
    const pBadge = wrapper.querySelector('#drawer-progress-badge');
    const pLiveFill = wrapper.querySelector('#drawer-progress-live-fill');

    const updateProgressVal = (val) => {
      val = Math.max(0, Math.min(100, parseInt(val, 10) || 0));
      dl.progressPercent = val;
      pRange.value = val;
      pNum.value = val;
      pValText.textContent = val + '%';
      pBadge.textContent = val + '%';
      pLiveFill.style.width = val + '%';
      this.saveConfig();
      this.applyLiveChanges();
    };

    pRange.addEventListener('input', (e) => updateProgressVal(e.target.value));
    pNum.addEventListener('input', (e) => updateProgressVal(e.target.value));

    // Progress Labels
    const pLabelInput = wrapper.querySelector('#drawer-progress-label');
    const pSublabelInput = wrapper.querySelector('#drawer-progress-sublabel');
    pLabelInput.addEventListener('input', (e) => {
      dl.progressLabel = e.target.value.trim();
      this.saveConfig();
      this.applyLiveChanges();
    });
    pSublabelInput.addEventListener('input', (e) => {
      dl.progressSublabel = e.target.value.trim();
      this.saveConfig();
      this.applyLiveChanges();
    });

    // Copy Inputs
    const badgeIn = wrapper.querySelector('#drawer-modal-badge');
    const titleIn = wrapper.querySelector('#drawer-modal-title');
    const subIn = wrapper.querySelector('#drawer-modal-subtitle');
    const btnTextIn = wrapper.querySelector('#drawer-modal-btn-text');
    const footerIn = wrapper.querySelector('#drawer-modal-footer-note');
    const successIn = wrapper.querySelector('#drawer-modal-success-msg');

    badgeIn.addEventListener('input', (e) => { dl.modalBadge = e.target.value.trim(); this.saveConfig(); this.applyLiveChanges(); });
    titleIn.addEventListener('input', (e) => { dl.modalTitle = e.target.value.trim(); this.saveConfig(); this.applyLiveChanges(); });
    subIn.addEventListener('input', (e) => { dl.modalSubtitle = e.target.value.trim(); this.saveConfig(); this.applyLiveChanges(); });
    btnTextIn.addEventListener('input', (e) => { dl.modalNotifyBtnText = e.target.value.trim(); this.saveConfig(); this.applyLiveChanges(); });
    footerIn.addEventListener('input', (e) => { dl.modalFooterNote = e.target.value.trim(); this.saveConfig(); this.applyLiveChanges(); });
    successIn.addEventListener('input', (e) => { dl.modalSuccessMsg = e.target.value.trim(); this.saveConfig(); this.applyLiveChanges(); });

    // Store & APK Inputs
    const playUrlIn = wrapper.querySelector('#drawer-play-url');
    const apkUrlIn = wrapper.querySelector('#drawer-apk-url');
    const apkFileIn = wrapper.querySelector('#drawer-apk-filename');
    const apkSizeIn = wrapper.querySelector('#drawer-apk-size');

    playUrlIn.addEventListener('input', (e) => { dl.playStoreUrl = e.target.value.trim(); this.saveConfig(); this.applyLiveChanges(); });
    apkUrlIn.addEventListener('input', (e) => { dl.apkDownloadUrl = e.target.value.trim(); this.saveConfig(); this.applyLiveChanges(); });
    apkFileIn.addEventListener('input', (e) => { dl.apkFileName = e.target.value.trim(); this.saveConfig(); this.applyLiveChanges(); });
    apkSizeIn.addEventListener('input', (e) => { dl.apkSize = e.target.value.trim(); this.saveConfig(); this.applyLiveChanges(); });

    // Preview Button
    wrapper.querySelector('#drawer-preview-modal-btn').addEventListener('click', () => {
      if (typeof window.openDownloadModal === 'function') {
        window.openDownloadModal();
      } else {
        const modal = document.getElementById('pre-launch-download-modal');
        if (modal) modal.classList.remove('hidden');
      }
    });

    // Export Waitlist CSV
    wrapper.querySelector('#drawer-export-waitlist-btn').addEventListener('click', () => {
      let list = [];
      try {
        list = JSON.parse(localStorage.getItem('treat_waitlist_subscribers') || '[]');
      } catch (e) {
        list = [];
      }
      if (list.length === 0) {
        this.showToast('No waitlist entries found yet');
        return;
      }
      let csv = 'Contact,Date,Timestamp\n';
      list.forEach(item => {
        csv += `"${(item.contact || '').replace(/"/g, '""')}","${item.date || ''}","${item.timestamp || ''}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'treat-early-invites.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      this.showToast(`Exported ${list.length} waitlist subscribers`);
    });

    // Save Button
    wrapper.querySelector('#drawer-save-dl-btn').addEventListener('click', () => {
      this.saveConfig();
      this.applyLiveChanges();
      this.showToast('App launch settings saved successfully');
    });
  }

  // --- TAB 5: BACKUP & CONFIG ---

  renderBackupTab(container) {
    container.innerHTML = `
      <div class="flex flex-col gap-4">
        <div>
          <h3 class="font-headline font-bold text-base text-on-surface">Configuration & JSON Backup</h3>
          <p class="text-xs text-on-surface-variant font-medium">Export your 4-phone configuration or restore factory defaults.</p>
        </div>

        <div class="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <div>
              <h5 class="font-bold text-xs text-on-surface">Export Configuration</h5>
              <p class="text-[11px] text-on-surface-variant">Download treat-landing-config.json</p>
            </div>
            <button id="admin-export-json-btn" class="px-3 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary hover:text-white text-xs font-bold flex items-center gap-1 transition-all">
              <span class="material-symbols-outlined text-[16px]">file_download</span>
              <span>Export JSON</span>
            </button>
          </div>

          <div class="h-px bg-outline-variant/20"></div>

          <div class="flex items-center justify-between">
            <div>
              <h5 class="font-bold text-xs text-on-surface">Import Configuration</h5>
              <p class="text-[11px] text-on-surface-variant">Restore configuration from a JSON file</p>
            </div>
            <label class="px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed hover:bg-tertiary hover:text-white text-xs font-bold cursor-pointer flex items-center gap-1 transition-all">
              <span class="material-symbols-outlined text-[16px]">file_upload</span>
              <span>Import JSON</span>
              <input type="file" id="admin-import-json-file" accept=".json" class="hidden">
            </label>
          </div>

          <div class="h-px bg-outline-variant/20"></div>

          <div class="flex items-center justify-between">
            <div>
              <h5 class="font-bold text-xs text-error">Reset to Factory Defaults</h5>
              <p class="text-[11px] text-on-surface-variant">Restore initial Treat 4-phone wave setup</p>
            </div>
            <button id="admin-reset-defaults-btn" class="px-3 py-1.5 rounded-full bg-error-container text-onErrorContainer hover:bg-error hover:text-white text-xs font-bold flex items-center gap-1 transition-all">
              <span class="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Export
    container.querySelector('#admin-export-json-btn').addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.config, null, 2));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute('href', dataStr);
      dlAnchor.setAttribute('download', 'treat-4phone-flow-config.json');
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      dlAnchor.remove();
    });

    // Import
    container.querySelector('#admin-import-json-file').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          try {
            const imported = JSON.parse(re.target.result);
            if (imported && Array.isArray(imported.flowSteps) && imported.flowSteps.length >= 4) {
              this.config = imported;
              this.saveConfig();
              this.showToast('Configuration imported successfully');
              this.renderCurrentTab();
            } else {
              this.showToast('Invalid configuration format');
            }
          } catch (err) {
            this.showToast('Error parsing JSON: ' + err.message);
          }
        };
        reader.readAsText(file);
      }
    });

    // Reset
    container.querySelector('#admin-reset-defaults-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset to Treat factory defaults?')) {
        localStorage.removeItem(this.storageKey);
        this.config = JSON.parse(JSON.stringify(window.TREAT_DEFAULT_DATA));
        this.saveConfig();
        this.showToast('Restored Treat defaults');
        this.renderCurrentTab();
      }
    });
  }

  // --- TAB: OFFICIAL SUPPORT & SOCIAL LINKS ---

  renderContactTab(container) {
    if (!this.config.contact) {
      this.config.contact = (window.TREAT_DEFAULT_DATA && window.TREAT_DEFAULT_DATA.contact)
        ? JSON.parse(JSON.stringify(window.TREAT_DEFAULT_DATA.contact))
        : {
            facebookUrl: 'https://facebook.com/treat.official',
            facebookLabel: 'Treat Official',
            supportEmail: 'support.treat@gmail.com',
            copyrightText: '© 2026 Treat Inc.'
          };
    }

    const c = this.config.contact;
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col gap-5';

    wrapper.innerHTML = `
      <div class="pb-2 border-b border-outline-variant/30">
        <h3 class="font-headline font-bold text-base text-on-surface">Support & Social Channels</h3>
        <p class="text-xs text-on-surface-variant font-medium">Manage Treat's official Facebook page, support contact email, and footer copyright.</p>
      </div>

      <div class="flex flex-col gap-4 bg-surface-low rounded-2xl p-4 sm:p-5 border border-outline-variant/20">
        <!-- Facebook Page URL -->
        <div>
          <label class="block text-xs font-bold text-on-surface mb-1 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-[#1877F2]"></span>
            <span>Official Facebook Page URL</span>
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[18px]">public</span>
            <input type="url" id="admin-contact-facebook-url" value="${c.facebookUrl || ''}" class="admin-input text-xs pl-9" placeholder="https://facebook.com/treat.official">
          </div>
          <p class="text-[10.5px] text-gray-400 mt-1">Visitors clicking this link will be directed to Treat's official Facebook page.</p>
        </div>

        <!-- Facebook Button Display Label -->
        <div>
          <label class="block text-xs font-bold text-on-surface mb-1">Facebook Button Label</label>
          <input type="text" id="admin-contact-facebook-label" value="${c.facebookLabel || 'Treat Official'}" class="admin-input text-xs" placeholder="Treat Official">
        </div>

        <!-- Support Email -->
        <div>
          <label class="block text-xs font-bold text-on-surface mb-1 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            <span>Official Support Email Address</span>
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[18px]">mail</span>
            <input type="email" id="admin-contact-support-email" value="${c.supportEmail || 'support.treat@gmail.com'}" class="admin-input text-xs pl-9" placeholder="support.treat@gmail.com">
          </div>
          <p class="text-[10.5px] text-gray-400 mt-1">Direct inquiries, squad questions, and partner feedback will open a mail compose window to this address.</p>
        </div>

        <!-- Footer Copyright Text -->
        <div>
          <label class="block text-xs font-bold text-on-surface mb-1">Footer Copyright Text</label>
          <input type="text" id="admin-contact-copyright" value="${c.copyrightText || '© 2026 Treat Inc.'}" class="admin-input text-xs" placeholder="© 2026 Treat Inc.">
        </div>

        <!-- Save Button -->
        <button type="button" id="admin-save-contact-btn" class="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-extrabold shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 mt-2">
          <span class="material-symbols-outlined text-[18px]">save</span>
          <span>Save Support & Social Settings</span>
        </button>
      </div>
    `;

    const fbUrlInput = wrapper.querySelector('#admin-contact-facebook-url');
    const fbLabelInput = wrapper.querySelector('#admin-contact-facebook-label');
    const emailInput = wrapper.querySelector('#admin-contact-support-email');
    const copyrightInput = wrapper.querySelector('#admin-contact-copyright');
    const saveBtn = wrapper.querySelector('#admin-save-contact-btn');

    const saveSettings = () => {
      c.facebookUrl = fbUrlInput.value.trim();
      c.facebookLabel = fbLabelInput.value.trim() || 'Treat Official';
      c.supportEmail = emailInput.value.trim() || 'support.treat@gmail.com';
      c.copyrightText = copyrightInput.value.trim() || '© 2026 Treat Inc.';

      this.saveConfig();
      this.applyLiveChanges();
      this.showToast('Support email & Facebook settings saved!');
    };

    saveBtn.addEventListener('click', saveSettings);

    [fbUrlInput, fbLabelInput, emailInput, copyrightInput].forEach(inp => {
      inp.addEventListener('input', () => {
        c.facebookUrl = fbUrlInput.value.trim();
        c.facebookLabel = fbLabelInput.value.trim() || 'Treat Official';
        c.supportEmail = emailInput.value.trim() || 'support.treat@gmail.com';
        c.copyrightText = copyrightInput.value.trim() || '© 2026 Treat Inc.';
        this.saveConfig(true);
        this.applyLiveChanges();
      });
    });

    container.appendChild(wrapper);
  }

  // --- Live DOM Synchronization ---

  applyLiveChanges() {
    // 1. Update Hero texts
    const heroBadge = document.getElementById('hero-badge-text');
    if (heroBadge && this.config.brand.heroBadge) {
      heroBadge.textContent = this.config.brand.heroBadge;
    }

    const heroHeadline = document.getElementById('hero-headline-text');
    if (heroHeadline && this.config.brand.heroHeadline) {
      if (this.config.brand.heroHeadline.includes('Feast Together') || this.config.brand.heroHeadline.includes('Find Treat') || this.config.brand.heroHeadline.includes('Find your people')) {
        this.config.brand.heroHeadline = "Find Your Craving\nShare the Good Stuff\nMake It a Treat";
        try { localStorage.setItem(this.storageKey, JSON.stringify(this.config)); } catch (e) { }
      }

      if (this.config.brand.heroHeadline.includes('Find Your Craving')) {
        heroHeadline.innerHTML = `
          <span class="hero-title-line flex items-center justify-center lg:justify-start gap-2 sm:gap-3 text-[#181024]">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-[#9357E8] -rotate-12 shrink-0 select-none hidden sm:inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
              <path d="M6 15 C5 12 5.5 8 8 6" />
              <path d="M12 18 C11 16 11.5 13.5 13 11" />
            </svg>
            <span>Find Your Craving</span>
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-[#9357E8] rotate-12 shrink-0 select-none hidden sm:inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
              <path d="M18 15 C19 12 18.5 8 16 6" />
              <path d="M12 18 C13 16 12.5 13.5 11 11" />
            </svg>
          </span>
          <span class="hero-title-line block text-center lg:text-left text-[#E040A0] my-0.5">
            <span class="hero-title-primary text-[#E040A0]">
              <span>Share </span>
              <span class="relative inline-block">
                <span>the Good Stuff</span>
                <svg class="absolute -bottom-2 sm:-bottom-3.5 left-0 w-full h-3 sm:h-4 overflow-visible pointer-events-none" viewBox="0 0 240 16" fill="none" preserveAspectRatio="none">
                  <path d="M 3 8 C 65 14, 155 15, 237 6" stroke="#E040A0" stroke-width="4.5" stroke-linecap="round" />
                </svg>
              </span>
            </span>
          </span>
          <span class="hero-title-line inline-flex items-center justify-center lg:justify-start gap-2.5 sm:gap-3 text-[#181024]">
            <span>Make It a Treat</span>
            <svg class="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-[#9357E8] -rotate-12 translate-y-0.5 shrink-0 select-none" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 27 C16 27, 4.5 19, 4.5 11.5 C4.5 6.5, 8.5 3.5, 12.5 4.5 C14.8 5.1, 15.6 6.8, 16 8 C16.4 6.8, 17.2 5.1, 19.5 4.5 C23.5 3.5, 27.5 6.5, 27.5 11.5 C27.5 19, 16 27, 16 27 Z" />
            </svg>
          </span>
        `;
      } else if (this.config.brand.heroHeadline.includes('\n')) {
        const lines = this.config.brand.heroHeadline.split('\n').map(s => s.trim()).filter(Boolean);
        heroHeadline.innerHTML = lines.map((line, idx) => {
          if (idx === 1) {
            return `<span class="hero-title-line block text-gradient-give">${line}</span>`;
          }
          return `<span class="hero-title-line block">${line}</span>`;
        }).join('');
      } else if (this.config.brand.heroHeadline.includes('<')) {
        heroHeadline.innerHTML = this.config.brand.heroHeadline;
      } else {
        heroHeadline.textContent = this.config.brand.heroHeadline;
      }
    }

    const heroCaption = document.getElementById('hero-caption-text');
    if (heroCaption && this.config.brand.heroCaption) {
      if (this.config.brand.heroCaption.includes('Discover amazing deals')) {
        this.config.brand.heroCaption = "Treat connects modern foodies with dynamic platter deals, automated budget matching, instant 2-minute table holds, and real-time kitchen floor sync. The all-in-one culinary squad experience.";
        try { localStorage.setItem(this.storageKey, JSON.stringify(this.config)); } catch (e) { }
      }
      heroCaption.textContent = this.config.brand.heroCaption;
    }

    const liveProof = document.getElementById('live-proof-text');
    if (liveProof && this.config.brand.liveSocialProof) {
      liveProof.textContent = this.config.brand.liveSocialProof;
    }

    // 2. Update Download CTA Button & Modal Elements in DOM
    const flowBtn = document.getElementById('flow-download-btn');
    const flowBtnText = document.getElementById('flow-cta-text');
    const flowSubtext = document.getElementById('flow-cta-subtext');

    if (this.config.download) {
      const dl = this.config.download;
      if (flowBtn && dl.apkDownloadUrl) {
        flowBtn.setAttribute('href', dl.apkDownloadUrl);
      }
      if (flowBtnText && dl.ctaText) {
        flowBtnText.textContent = dl.ctaText;
      }
      if (flowSubtext && dl.ctaSubtext) {
        flowSubtext.textContent = dl.ctaSubtext;
      }

      // Update in-page modal DOM elements if present
      const modalBadge = document.getElementById('modal-download-badge');
      const modalTitle = document.getElementById('modal-download-title');
      const modalSubtitle = document.getElementById('modal-download-subtitle');
      const modalNotifyBtn = document.getElementById('modal-notify-btn-text');
      const modalSuccessMsg = document.getElementById('modal-success-text');
      const modalFooterNote = document.getElementById('modal-footer-note');
      const modalProgressBar = document.getElementById('modal-progress-bar-fill');
      const modalProgressVal = document.getElementById('modal-progress-percent-val');
      const modalProgressLabel = document.getElementById('modal-progress-label');
      const modalProgressSublabel = document.getElementById('modal-progress-sublabel');
      const modalLiveLinks = document.getElementById('modal-live-links');
      const modalPlayBtn = document.getElementById('modal-playstore-btn');
      const modalApkBtn = document.getElementById('modal-direct-apk-btn');
      const modalApkSize = document.getElementById('modal-apk-size-label');

      if (modalBadge && dl.modalBadge) {
        modalBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#E040A0] animate-ping"></span><span>${dl.modalBadge}</span>`;
      }
      if (modalTitle && dl.modalTitle) modalTitle.textContent = dl.modalTitle;
      if (modalSubtitle && dl.modalSubtitle) modalSubtitle.textContent = dl.modalSubtitle;
      if (modalNotifyBtn && dl.modalNotifyBtnText) modalNotifyBtn.textContent = dl.modalNotifyBtnText;
      if (modalSuccessMsg && dl.modalSuccessMsg) modalSuccessMsg.textContent = dl.modalSuccessMsg;
      if (modalFooterNote && dl.modalFooterNote) modalFooterNote.textContent = dl.modalFooterNote;

      const percent = (dl.progressPercent !== undefined && dl.progressPercent !== null) ? dl.progressPercent : 85;
      if (modalProgressBar) modalProgressBar.style.width = percent + '%';
      if (modalProgressVal) modalProgressVal.textContent = percent + '%';
      if (modalProgressLabel && dl.progressLabel) modalProgressLabel.textContent = dl.progressLabel;
      if (modalProgressSublabel && dl.progressSublabel) modalProgressSublabel.textContent = dl.progressSublabel;

      if (modalLiveLinks) {
        if (dl.mode === 'play_store' || dl.mode === 'direct_apk' || dl.mode === 'store_and_apk') {
          modalLiveLinks.classList.remove('hidden');
        } else {
          modalLiveLinks.classList.add('hidden');
        }
      }

      if (modalPlayBtn && dl.playStoreUrl) modalPlayBtn.href = dl.playStoreUrl;
      if (modalApkBtn && dl.apkDownloadUrl) {
        modalApkBtn.href = dl.apkDownloadUrl;
        modalApkBtn.setAttribute('download', dl.apkFileName || 'Treat.apk');
      }
      if (modalApkSize && dl.apkSize) modalApkSize.textContent = dl.apkSize;
    }

    // 3. Update 4-Phone Screen Flow in DOM
    if (this.flow && Array.isArray(this.config.flowSteps)) {
      this.flow.setSteps(this.config.flowSteps);
    }

    // 4. Update 3-Person Team Profiles in DOM
    const team = this.config.team || (this.config.developer ? [this.config.developer] : []);
    if (Array.isArray(team)) {
      team.forEach((member, idx) => {
        const nameEl = document.getElementById(`team-name-${idx}`);
        const roleEl = document.getElementById(`team-role-${idx}`);
        const bioEl = document.getElementById(`team-bio-${idx}`);
        const avatarEl = document.getElementById(`team-avatar-${idx}`);
        const portfolioEl = document.getElementById(`team-portfolio-${idx}`);
        const githubEl = document.getElementById(`team-github-${idx}`);
        const linkedinEl = document.getElementById(`team-linkedin-${idx}`);

        if (nameEl && member.name) nameEl.textContent = member.name;
        if (roleEl && member.role) roleEl.textContent = member.role;
        if (bioEl && member.bio) bioEl.textContent = member.bio;
        if (avatarEl && member.avatar) avatarEl.src = member.avatar;
        if (portfolioEl && member.portfolioUrl) portfolioEl.href = member.portfolioUrl;
        if (githubEl && member.githubUrl) githubEl.href = member.githubUrl;
        if (linkedinEl && member.linkedinUrl) linkedinEl.href = member.linkedinUrl;
      });
    }

    // Backwards-compatible update for legacy single developer elements if present
    if (this.config.developer) {
      const devName = document.getElementById('dev-profile-name');
      const devRole = document.getElementById('dev-profile-role');
      const devBio = document.getElementById('dev-profile-bio');
      const devAvatar = document.getElementById('dev-profile-avatar');
      const devGithub = document.getElementById('dev-profile-github');

      if (devName && this.config.developer.name) devName.textContent = this.config.developer.name;
      if (devRole && this.config.developer.role) devRole.textContent = this.config.developer.role;
      if (devBio && this.config.developer.bio) devBio.textContent = this.config.developer.bio;
      if (devAvatar && this.config.developer.avatar) devAvatar.src = this.config.developer.avatar;
      if (devGithub && this.config.developer.githubUrl) devGithub.href = this.config.developer.githubUrl;
    }

    // 5. Update Flow Step Titles & Descriptions below phones
    if (Array.isArray(this.config.flowSteps)) {
      this.config.flowSteps.forEach((step, idx) => {
        const titleEl = document.getElementById(`step-title-${idx}`);
        const descEl = document.getElementById(`step-desc-${idx}`);
        if (titleEl && step.title) titleEl.textContent = step.title;
        if (descEl && step.description) descEl.textContent = step.description;
      });

      // Update Phone 2 Budget Matcher defaults
      if (this.config.flowSteps[1] && this.config.flowSteps[1].budgetAmount) {
        const budgetVal = document.getElementById('budget-amount-val');
        const budgetSlider = document.getElementById('interactive-budget-slider');
        if (budgetVal) budgetVal.textContent = '৳ ' + this.config.flowSteps[1].budgetAmount;
        if (budgetSlider) budgetSlider.value = this.config.flowSteps[1].budgetAmount;
      }

      // Update Phone 3 Countdown timer default
      if (this.config.flowSteps[2] && this.config.flowSteps[2].holdTimerStart) {
        const holdTimer = document.getElementById('flow-countdown-timer');
        if (holdTimer) holdTimer.textContent = this.config.flowSteps[2].holdTimerStart;
      }
    }

    // 6. Update Featured Platters in DOM
    const foodContainer = document.getElementById('foodie-deals-container');
    if (foodContainer && Array.isArray(this.config.foodPhotos) && this.config.foodPhotos.length > 0) {
      foodContainer.innerHTML = this.config.foodPhotos.map(item => `
        <div class="snap-start shrink-0 w-[260px] md:w-[280px] rounded-3xl overflow-hidden glass-panel flex flex-col group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
          <div class="h-44 w-full relative overflow-hidden bg-surface-container">
            <img src="${item.src}" alt="${item.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
            <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary text-white text-[10px] font-extrabold tracking-wide uppercase shadow-md">
              ${item.tag}
            </span>
            <span class="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-surface/90 backdrop-blur-md text-on-surface text-xs font-black shadow">
              ${item.price}
            </span>
          </div>
          <div class="p-4 flex flex-col justify-between flex-1">
            <h4 class="font-headline font-bold text-sm text-on-surface truncate">${item.title}</h4>
            <p class="text-xs text-on-surface-variant font-medium mt-1">Available across top participating Treat partner kitchens.</p>
            <div class="mt-3 pt-2 border-t border-outline-variant/30 flex items-center justify-between">
              <span class="text-[11px] font-bold text-secondary flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">bolt</span> Instant Match
              </span>
              <span class="text-xs font-black text-primary">Explore Platter →</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    // 7. Update Reviews in DOM
    const reviewsContainer = document.getElementById('reviews-container');
    if (reviewsContainer && Array.isArray(this.config.reviews) && this.config.reviews.length > 0) {
      reviewsContainer.innerHTML = this.config.reviews.map(rev => `
        <div class="p-6 rounded-3xl glass-panel flex flex-col justify-between gap-4 transition-transform hover:-translate-y-1">
          <div class="flex items-center gap-1 text-primary">
            ${'<span class="material-symbols-outlined text-[18px]">star</span>'.repeat(rev.rating || 5)}
          </div>
          <p class="text-xs md:text-sm text-on-surface-variant font-medium leading-relaxed italic">
            "${rev.comment}"
          </p>
          <div class="flex items-center gap-3 pt-3 border-t border-outline-variant/30">
            <div class="w-9 h-9 rounded-full overflow-hidden bg-surface-container shrink-0 border border-primary/20">
              <img src="${rev.avatar}" alt="${rev.name}" class="w-full h-full object-cover">
            </div>
            <div>
              <h5 class="font-headline font-bold text-xs text-on-surface leading-tight">${rev.name}</h5>
              <span class="text-[10px] text-on-surface-variant font-medium">${rev.role}</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    // 8. Update Support & Social Channels in DOM
    if (this.config.contact) {
      const c = this.config.contact;
      const fbLinks = [document.getElementById('footer-facebook-link'), document.getElementById('team-facebook-btn')];
      const fbTexts = [document.getElementById('footer-facebook-text'), document.getElementById('team-facebook-text')];
      const emailLinks = [document.getElementById('footer-email-link'), document.getElementById('team-email-btn')];
      const emailTexts = [document.getElementById('footer-email-text'), document.getElementById('team-email-text')];
      const copyrightEl = document.getElementById('footer-copyright-text');

      if (c.facebookUrl) fbLinks.forEach(el => { if (el) el.href = c.facebookUrl; });
      if (c.facebookLabel) fbTexts.forEach(el => { if (el) el.textContent = c.facebookLabel; });
      if (c.supportEmail) {
        emailLinks.forEach(el => { if (el) el.href = `mailto:${c.supportEmail}`; });
        emailTexts.forEach(el => { if (el) el.textContent = c.supportEmail; });
      }
      if (c.copyrightText && copyrightEl) copyrightEl.textContent = c.copyrightText;
    }
  }
}
if (typeof window !== 'undefined') {
  window.TreatAdminPanel = TreatAdminPanel;
}

