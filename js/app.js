/**
 * Treat Landing Page - Main Orchestrator
 * Coordinates 4-Phone Wave Flow, 3D Interactive Turntable Modal, Admin Studio, and Downloads
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 4-Phone Screen Flow (Parallax, Step Sync, Hover highlights)
  const flow = new TreatScreenFlow();

  // 2. Initialize Admin Studio Panel
  const admin = new TreatAdminPanel(flow);

  window.treatApp = { flow, admin };

  // 3. Setup Download Actions & QR Modal
  setupDownloadActions();

  // 4. Setup Foodie Deals & Testimonials
  setupPerksAndReviews();

  // 5. Setup View Switcher & 3D Interactive Phone Model
  setupShowcaseViewSwitcher();

  // 6. Setup Live Countdown Timer on Table Hold Screen
  setupCountdownTimer();

  // 7. Setup Interactive Budget Slider & Watch Button
  setupInteractiveBudgetSlider();
  setupWatchHowItWorks();

  // 8. Setup Secret 3-Click Admin Studio Trigger on Hero Headline Title
  setupSecretTitleAdmin(admin);

  // 9. Setup Official Facebook & Support Email Channels
  setupContactAndFooter();

  console.log('Treat Vertical Flow and Storytelling initialized successfully.');

  function setupDownloadActions() {
    const downloadModal = document.getElementById('app-download-modal');
    const downloadBackdrop = document.getElementById('app-download-backdrop');
    const closeDownloadBtn = document.getElementById('close-download-modal-btn');
    const waitlistForm = document.getElementById('modal-waitlist-form');
    const waitlistInput = document.getElementById('modal-waitlist-input');
    const waitlistSuccess = document.getElementById('modal-waitlist-success');
    const waitlistSection = document.getElementById('modal-waitlist-section');

    const qrModal = document.getElementById('qr-code-modal');
    const openQrBtn = document.getElementById('open-qr-modal-btn');
    const closeQrBtn = document.getElementById('close-qr-modal-btn');
    const qrBackdrop = document.getElementById('qr-modal-backdrop');

    function getDownloadConfig() {
      if (window.treatApp && window.treatApp.admin && window.treatApp.admin.config && window.treatApp.admin.config.download) {
        return window.treatApp.admin.config.download;
      }
      try {
        const stored = localStorage.getItem('treat_landing_config_v4');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.download) return parsed.download;
        }
      } catch (e) {}
      return (window.TREAT_DEFAULT_DATA && window.TREAT_DEFAULT_DATA.download) ? window.TREAT_DEFAULT_DATA.download : {};
    }

    function openPreLaunchModal() {
      if (!downloadModal) return;
      const dlConfig = getDownloadConfig();

      const badgeEl = document.getElementById('modal-download-badge');
      const titleEl = document.getElementById('modal-download-title');
      const subEl = document.getElementById('modal-download-subtitle');
      const notifyBtnText = document.getElementById('modal-notify-btn-text');
      const progressLabelEl = document.getElementById('modal-progress-label');
      const progressValEl = document.getElementById('modal-progress-percent-val');
      const progressFillEl = document.getElementById('modal-progress-bar-fill');
      const progressSubEl = document.getElementById('modal-progress-sublabel');
      const footerNoteEl = document.getElementById('modal-footer-note');
      const liveLinks = document.getElementById('modal-live-links');
      const playBtn = document.getElementById('modal-playstore-btn');
      const apkBtn = document.getElementById('modal-direct-apk-btn');
      const apkSizeLabel = document.getElementById('modal-apk-size-label');

      if (badgeEl && dlConfig.modalBadge) {
        badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#E040A0] animate-ping"></span><span>${dlConfig.modalBadge}</span>`;
      }
      if (titleEl && dlConfig.modalTitle) titleEl.textContent = dlConfig.modalTitle;
      if (subEl && dlConfig.modalSubtitle) subEl.textContent = dlConfig.modalSubtitle;
      if (notifyBtnText && dlConfig.modalNotifyBtnText) notifyBtnText.textContent = dlConfig.modalNotifyBtnText;

      const percent = (dlConfig.progressPercent !== undefined && dlConfig.progressPercent !== null) ? dlConfig.progressPercent : 85;
      if (progressFillEl) progressFillEl.style.width = `${percent}%`;
      if (progressValEl) progressValEl.textContent = `${percent}%`;
      if (progressLabelEl && dlConfig.progressLabel) progressLabelEl.textContent = dlConfig.progressLabel;
      if (progressSubEl && dlConfig.progressSublabel) progressSubEl.textContent = dlConfig.progressSublabel;
      if (footerNoteEl && dlConfig.modalFooterNote) footerNoteEl.textContent = dlConfig.modalFooterNote;

      if (apkSizeLabel && dlConfig.apkSize) apkSizeLabel.textContent = dlConfig.apkSize;
      const successTextEl = document.getElementById('modal-success-text');
      if (successTextEl && dlConfig.modalSuccessMsg) successTextEl.textContent = dlConfig.modalSuccessMsg;

      // Show live store links if configured
      if (liveLinks) {
        if (dlConfig.mode === 'play_store' || dlConfig.mode === 'direct_apk' || dlConfig.mode === 'store_and_apk') {
          liveLinks.classList.remove('hidden');
          if (playBtn && dlConfig.playStoreUrl) playBtn.href = dlConfig.playStoreUrl;
          if (apkBtn && dlConfig.apkDownloadUrl) {
            apkBtn.href = dlConfig.apkDownloadUrl;
            apkBtn.setAttribute('download', dlConfig.apkFileName || 'Treat.apk');
          }
        } else {
          liveLinks.classList.add('hidden');
        }
      }

      // Reset waitlist form view
      if (waitlistSection) waitlistSection.classList.remove('hidden');
      if (waitlistSuccess) waitlistSuccess.classList.add('hidden');
      if (waitlistInput) waitlistInput.value = '';

      downloadModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      if (waitlistInput) setTimeout(() => waitlistInput.focus(), 150);
    }

    function closePreLaunchModal() {
      if (!downloadModal) return;
      downloadModal.classList.add('hidden');
      document.body.style.overflow = '';
    }

    window.openDownloadModal = openPreLaunchModal;
    window.closeDownloadModal = closePreLaunchModal;

    if (closeDownloadBtn) closeDownloadBtn.addEventListener('click', closePreLaunchModal);
    if (downloadBackdrop) downloadBackdrop.addEventListener('click', closePreLaunchModal);

    // Escape key listener for closing modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closePreLaunchModal();
        if (qrModal) qrModal.classList.add('hidden');
      }
    });

    // Waitlist Form Submission
    if (waitlistForm) {
      waitlistForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = waitlistInput ? waitlistInput.value.trim() : '';
        if (!val) return;

        try {
          const list = JSON.parse(localStorage.getItem('treat_waitlist_subscribers') || '[]');
          list.push({
            contact: val,
            date: new Date().toISOString()
          });
          localStorage.setItem('treat_waitlist_subscribers', JSON.stringify(list));
        } catch (err) {
          console.warn('Could not persist to waitlist:', err);
        }

        if (waitlistSection) waitlistSection.classList.add('hidden');
        if (waitlistSuccess) waitlistSuccess.classList.remove('hidden');

        const successMsg = (dlConfig && dlConfig.modalSuccessMsg) ? dlConfig.modalSuccessMsg : "✨ You're on the early invite list! Keep an eye on your inbox.";
        showToast(successMsg);
      });
    }

    // Universal Download Handler for all triggers
    const handleDownloadTrigger = (e) => {
      e.preventDefault();
      const dlConfig = getDownloadConfig();
      const mode = dlConfig.mode || 'coming_soon';

      if (mode === 'coming_soon' || mode === 'store_and_apk') {
        openPreLaunchModal();
      } else if (mode === 'play_store') {
        if (dlConfig.playStoreUrl && dlConfig.playStoreUrl.startsWith('http')) {
          window.open(dlConfig.playStoreUrl, '_blank', 'noopener,noreferrer');
        } else {
          openPreLaunchModal();
        }
      } else if (mode === 'direct_apk') {
        if (dlConfig.apkDownloadUrl) {
          const dlLink = document.createElement('a');
          dlLink.href = dlConfig.apkDownloadUrl;
          dlLink.setAttribute('download', dlConfig.apkFileName || 'Treat.apk');
          document.body.appendChild(dlLink);
          dlLink.click();
          dlLink.remove();
          showToast(`Starting Treat APK download (${dlConfig.apkSize || '24.8 MB'})...`);
        } else {
          openPreLaunchModal();
        }
      }
    };

    // Attach to all download buttons
    document.querySelectorAll('.download-trigger-btn, #flow-download-btn').forEach(btn => {
      btn.addEventListener('click', handleDownloadTrigger);
    });

    // QR Modal triggers
    if (openQrBtn && qrModal) {
      openQrBtn.addEventListener('click', () => {
        qrModal.classList.remove('hidden');
        generateSimpleQrCode();
      });
    }

    const closeQr = () => {
      if (qrModal) qrModal.classList.add('hidden');
    };

    if (closeQrBtn) closeQrBtn.addEventListener('click', closeQr);
    if (qrBackdrop) qrBackdrop.addEventListener('click', closeQr);
  }

  function showToast(message) {
    let toast = document.getElementById('treat-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'treat-toast';
      toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full bg-on-surface text-white text-xs font-bold shadow-2xl z-[160] transition-all duration-300 opacity-0 pointer-events-none flex items-center gap-2 border border-primary/40';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `<span class="material-symbols-outlined text-primary text-[18px]">celebration</span><span>${message}</span>`;
    toast.classList.remove('opacity-0', 'pointer-events-none');
    toast.classList.add('opacity-100');

    setTimeout(() => {
      toast.classList.remove('opacity-100');
      toast.classList.add('opacity-0', 'pointer-events-none');
    }, 3200);
  }

  function generateSimpleQrCode() {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = '#2E1A28';
    const grid = 25;
    const cellSize = size / grid;

    function drawFinder(r, c) {
      ctx.fillStyle = '#2E1A28';
      ctx.fillRect(c * cellSize, r * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect((c + 1) * cellSize, (r + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect((c + 2) * cellSize, (r + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    }

    drawFinder(1, 1);
    drawFinder(1, grid - 8);
    drawFinder(grid - 8, 1);

    let seed = 42;
    function random() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }

    ctx.fillStyle = '#2E1A28';
    for (let r = 0; r < grid; r++) {
      for (let c = 0; c < grid; c++) {
        const inFinder1 = r < 9 && c < 9;
        const inFinder2 = r < 9 && c > grid - 10;
        const inFinder3 = r > grid - 10 && c < 9;
        if (inFinder1 || inFinder2 || inFinder3) continue;

        if (random() > 0.52) {
          ctx.fillRect(c * cellSize + 0.5, r * cellSize + 0.5, cellSize - 1, cellSize - 1);
        }
      }
    }

    const centerSize = cellSize * 5;
    const centerX = (size - centerSize) / 2;
    const centerY = (size - centerSize) / 2;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(centerX, centerY, centerSize, centerSize);
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, centerSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('treat', size / 2, size / 2);
  }

  function setupPerksAndReviews() {
    const foodContainer = document.getElementById('foodie-deals-container');
    if (foodContainer && window.TREAT_DEFAULT_DATA && Array.isArray(window.TREAT_DEFAULT_DATA.foodPhotos)) {
      foodContainer.innerHTML = window.TREAT_DEFAULT_DATA.foodPhotos.map(item => `
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

    const reviewsContainer = document.getElementById('reviews-container');
    if (reviewsContainer && window.TREAT_DEFAULT_DATA && Array.isArray(window.TREAT_DEFAULT_DATA.reviews)) {
      reviewsContainer.innerHTML = window.TREAT_DEFAULT_DATA.reviews.map(rev => `
        <div class="p-6 rounded-3xl glass-panel flex flex-col justify-between gap-4 transition-transform hover:-translate-y-1">
          <div class="flex items-center gap-1 text-primary">
            ${'<span class="material-symbols-outlined text-[18px]">star</span>'.repeat(rev.rating)}
          </div>
          <p class="text-xs md:text-sm text-on-surface font-medium leading-relaxed italic">
            "${rev.comment}"
          </p>
          <div class="flex items-center gap-3 pt-2 border-t border-outline-variant/20">
            <img src="${rev.avatar}" alt="${rev.name}" class="w-10 h-10 rounded-full object-cover ring-2 ring-primary/40">
            <div>
              <h5 class="font-bold text-xs text-on-surface">${rev.name}</h5>
              <span class="text-[11px] text-on-surface-variant font-medium">${rev.role}</span>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  function setupShowcaseViewSwitcher() {
    const tabFlow = document.getElementById('showcase-tab-flow');
    const tab3d = document.getElementById('showcase-tab-3d');
    const flowView = document.getElementById('flow-wave-view');
    const turntableView = document.getElementById('phone-3d-turntable-view');
    let phone3dInstance = null;

    if (!tabFlow || !tab3d || !flowView || !turntableView) return;

    tabFlow.addEventListener('click', () => {
      tabFlow.className = 'px-4 py-1.5 rounded-full text-xs font-bold transition-all bg-gradient-to-r from-primary to-secondary text-white shadow-sm flex items-center gap-1.5 active:scale-95';
      tab3d.className = 'px-4 py-1.5 rounded-full text-xs font-bold transition-all text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 active:scale-95';
      flowView.classList.remove('hidden');
      turntableView.classList.add('hidden');
    });

    tab3d.addEventListener('click', () => {
      tab3d.className = 'px-4 py-1.5 rounded-full text-xs font-bold transition-all bg-gradient-to-r from-primary to-secondary text-white shadow-sm flex items-center gap-1.5 active:scale-95';
      tabFlow.className = 'px-4 py-1.5 rounded-full text-xs font-bold transition-all text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 active:scale-95';
      flowView.classList.add('hidden');
      turntableView.classList.remove('hidden');

      if (!phone3dInstance && window.TreatPhone3D) {
        phone3dInstance = new TreatPhone3D('phone-3d-canvas-container', {
          autoRotate: true,
          autoRotateSpeed: 0.8,
          phoneColor: 'pink',
          enableParallax: true
        });
        window.treatApp.phone3d = phone3dInstance;

        // Color buttons
        document.querySelectorAll('.phone-color-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const color = e.currentTarget.getAttribute('data-color');
            if (phone3dInstance && typeof phone3dInstance.setPhoneColor === 'function') {
              phone3dInstance.setPhoneColor(color);
            }
            document.querySelectorAll('.phone-color-btn').forEach(b => b.classList.remove('ring-2', 'ring-primary', 'ring-offset-2'));
            e.currentTarget.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
          });
        });

        // Angle buttons
        document.querySelectorAll('.phone-angle-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const angle = e.currentTarget.getAttribute('data-angle');
            if (phone3dInstance && typeof phone3dInstance.setCameraAngle === 'function') {
              phone3dInstance.setCameraAngle(angle);
            }
            document.querySelectorAll('.phone-angle-btn').forEach(b => {
              b.className = 'phone-angle-btn px-2.5 py-1 rounded-xl text-[11px] font-bold text-on-surface hover:bg-surface-container active:scale-95';
            });
            e.currentTarget.className = 'phone-angle-btn px-2.5 py-1 rounded-xl text-[11px] font-bold text-primary bg-primary-fixed/40 active:scale-95';
          });
        });

        // Screen selector
        const screenSelect = document.getElementById('turntable-screen-select');
        if (screenSelect) {
          screenSelect.addEventListener('change', (e) => {
            if (phone3dInstance && typeof phone3dInstance.setScreenImage === 'function') {
              phone3dInstance.setScreenImage(e.target.value);
            }
          });
        }
      }
    });
  }

  function setupCountdownTimer() {
    const timerEl = document.getElementById('flow-countdown-timer') || document.getElementById('hold-countdown-timer');
    const circleEl = document.getElementById('flow-countdown-circle') || document.getElementById('hold-progress-circle');
    if (!timerEl) return;

    let secondsLeft = 102; // 01:42 matching reference design
    const totalSeconds = 120;
    const circumference = 251.3;

    const updateTimer = () => {
      const mins = Math.floor(secondsLeft / 60);
      const secs = secondsLeft % 60;
      timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      if (circleEl) {
        const fraction = secondsLeft / totalSeconds;
        const offset = circumference * (1 - fraction);
        circleEl.style.strokeDashoffset = offset.toFixed(1);
      }
    };

    updateTimer();

    setInterval(() => {
      secondsLeft--;
      if (secondsLeft < 0) {
        secondsLeft = 120; // loop back to 2 minutes
      }
      updateTimer();
    }, 1000);
  }

  function setupInteractiveBudgetSlider() {
    const slider = document.getElementById('interactive-budget-slider');
    const amountVal = document.getElementById('budget-amount-val');
    if (!slider || !amountVal) return;

    slider.addEventListener('input', (e) => {
      amountVal.textContent = `৳ ${e.target.value}`;
    });
  }

  function setupWatchHowItWorks() {
    const watchBtn = document.getElementById('hero-watch-btn');
    if (!watchBtn) return;

    watchBtn.addEventListener('click', () => {
      const target = document.getElementById('feature-01') || document.getElementById('workflow-flow');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  function setupSecretTitleAdmin(adminInstance) {
    const titleEl = document.getElementById('hero-headline-text');
    if (!titleEl) return;

    let clickCount = 0;
    let clickTimer = null;

    titleEl.addEventListener('click', (e) => {
      clickCount++;
      clearTimeout(clickTimer);

      if (clickCount >= 3) {
        e.preventDefault();
        e.stopPropagation();
        clickCount = 0;

        // Easter egg micro-animation on hero headline (delightful subtle spring bounce)
        titleEl.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
        titleEl.style.transform = 'scale(1.025)';
        setTimeout(() => {
          titleEl.style.transform = '';
        }, 350);

        // Open Admin Studio (triggers Firebase login modal if unauthenticated, or drawer if authenticated)
        if (adminInstance && typeof adminInstance.open === 'function') {
          adminInstance.open();
        } else if (window.treatApp && window.treatApp.admin) {
          window.treatApp.admin.open();
        } else {
          const modal = document.getElementById('admin-login-modal');
          if (modal) modal.classList.remove('hidden');
        }
        return;
      }

      clickTimer = setTimeout(() => {
        clickCount = 0;
      }, 850);
    });
  }

  // 8. Setup Interactive 3D Cursor Tilt for Phone Chassis
  setupPhone3DMouseTilt();

  function setupPhone3DMouseTilt() {
    if (window.matchMedia('(max-width: 1024px)').matches) return;

    const phoneWrappers = document.querySelectorAll('.flow-phone-wrapper');
    phoneWrappers.forEach((wrapper) => {
      const chassis = wrapper.querySelector('.flow-phone-chassis');
      if (!chassis) return;

      wrapper.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;

        const rotateX = -deltaY * 8;
        const rotateY = deltaX * 10;

        chassis.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px)`;
      });

      wrapper.addEventListener('mouseleave', () => {
        chassis.style.transform = '';
      });
    });
  }

  // 9. Mobile Navigation Drawer Setup
  setupMobileNavigation();

  function setupMobileNavigation() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const menuIcon = document.getElementById('mobile-menu-icon');
    const dropdown = document.getElementById('mobile-nav-dropdown');

    if (!menuBtn || !dropdown) return;

    function toggleMenu() {
      const isHidden = dropdown.classList.contains('hidden');
      if (isHidden) {
        dropdown.classList.remove('hidden');
        if (menuIcon) menuIcon.textContent = 'close';
      } else {
        dropdown.classList.add('hidden');
        if (menuIcon) menuIcon.textContent = 'menu';
      }
    }

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Close when clicking any nav item
    dropdown.querySelectorAll('.mobile-nav-item').forEach((item) => {
      item.addEventListener('click', () => {
        dropdown.classList.add('hidden');
        if (menuIcon) menuIcon.textContent = 'menu';
      });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && !menuBtn.contains(e.target)) {
        if (!dropdown.classList.contains('hidden')) {
          dropdown.classList.add('hidden');
          if (menuIcon) menuIcon.textContent = 'menu';
        }
      }
    });
  }

  // 10. Mobile 4-Phone Horizontal Flow Track & Tabs Sync
  setupMobileFlowTrackSync();

  function setupMobileFlowTrackSync() {
    const track = document.getElementById('flow-cards-track');
    const stepTabs = document.querySelectorAll('.mobile-step-tab');
    const stepDots = document.querySelectorAll('.mobile-flow-dot');
    const cards = document.querySelectorAll('.flow-card-item');

    if (!track || cards.length === 0) return;

    let activeStep = 0;

    function updateActiveIndicators(index) {
      if (index === activeStep && stepTabs[index] && stepTabs[index].classList.contains('active')) return;
      activeStep = index;

      // Update Step Tabs
      stepTabs.forEach((tab, idx) => {
        if (idx === index) {
          tab.classList.add('active');
          tab.classList.remove('text-gray-500');
        } else {
          tab.classList.remove('active');
          tab.classList.add('text-gray-500');
        }
      });

      // Update Dots
      stepDots.forEach((dot, idx) => {
        if (idx === index) {
          dot.className = 'mobile-flow-dot w-6 h-2 rounded-full bg-[#181024] transition-all';
        } else {
          dot.className = 'mobile-flow-dot w-2 h-2 rounded-full bg-purple-200 hover:bg-purple-300 transition-all';
        }
      });
    }

    // Tab clicks
    stepTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const step = parseInt(tab.getAttribute('data-step') || '0', 10);
        scrollToCard(step);
      });
    });

    // Dot clicks
    stepDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const step = parseInt(dot.getAttribute('data-step') || '0', 10);
        scrollToCard(step);
      });
    });

    function scrollToCard(index) {
      const card = document.querySelector(`.flow-card-item[data-step-index="${index}"]`) || cards[index];
      if (!card || !track) return;

      const trackRect = track.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const currentScroll = track.scrollLeft;
      const targetOffset = currentScroll + (cardRect.left - trackRect.left) - (track.clientWidth - card.clientWidth) / 2;

      track.scrollTo({
        left: Math.max(0, targetOffset),
        behavior: 'smooth'
      });

      updateActiveIndicators(index);
    }

    // Scroll listener with requestAnimationFrame debounce
    let scrollTicking = false;
    track.addEventListener('scroll', () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          findCurrentSnappedCard();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });

    function findCurrentSnappedCard() {
      const trackCenter = track.getBoundingClientRect().left + track.clientWidth / 2;
      let closestDist = Infinity;
      let closestIdx = 0;

      cards.forEach((card, idx) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const dist = Math.abs(cardCenter - trackCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = idx;
        }
      });

      updateActiveIndicators(closestIdx);
    }
  }

  function setupContactAndFooter() {
    function getContactConfig() {
      if (window.treatApp && window.treatApp.admin && window.treatApp.admin.config && window.treatApp.admin.config.contact) {
        return window.treatApp.admin.config.contact;
      }
      try {
        const stored = localStorage.getItem('treat_landing_config_v4');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.contact) return parsed.contact;
        }
      } catch (e) {}
      return (window.TREAT_DEFAULT_DATA && window.TREAT_DEFAULT_DATA.contact) ? window.TREAT_DEFAULT_DATA.contact : {};
    }

    const contact = getContactConfig();
    if (contact && contact.copyrightText && contact.copyrightText.includes('Funky Foodie Life')) {
      contact.copyrightText = contact.copyrightText.replace(/\s*Funky Foodie Life\.?/gi, '').trim();
      try {
        ['treat_landing_config_v4', 'treat_landing_config'].forEach(k => {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.contact) {
              parsed.contact.copyrightText = contact.copyrightText;
              localStorage.setItem(k, JSON.stringify(parsed));
            }
          }
        });
      } catch (e) {}
    }

    const fbLinks = [document.getElementById('footer-facebook-link'), document.getElementById('team-facebook-btn')];
    const fbTexts = [document.getElementById('footer-facebook-text'), document.getElementById('team-facebook-text')];
    const emailLinks = [document.getElementById('footer-email-link'), document.getElementById('team-email-btn')];
    const emailTexts = [document.getElementById('footer-email-text'), document.getElementById('team-email-text')];
    const copyrightEl = document.getElementById('footer-copyright-text');

    if (contact.facebookUrl) {
      fbLinks.forEach(el => { if (el) el.href = contact.facebookUrl; });
    }
    if (contact.facebookLabel) {
      fbTexts.forEach(el => { if (el) el.textContent = contact.facebookLabel; });
    }
    if (contact.supportEmail) {
      emailLinks.forEach(el => { if (el) el.href = `mailto:${contact.supportEmail}`; });
      emailTexts.forEach(el => { if (el) el.textContent = contact.supportEmail; });
    }
    if (contact.copyrightText && copyrightEl) {
      copyrightEl.textContent = contact.copyrightText;
    }
  }
});

