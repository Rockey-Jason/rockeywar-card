/* Dori Sound System — premium synthesized UI audio, no external assets */
(() => {
  'use strict';
  if (window.__DORI_SOUND_SYSTEM__) return;
  window.__DORI_SOUND_SYSTEM__ = true;

  const KEY = 'doriSoundSettings.v1';
  const defaults = { enabled: true, volume: 100 };
  let settings = { ...defaults };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && typeof saved === 'object') {
      settings.enabled = saved.enabled !== false;
      settings.volume = Math.max(0, Math.min(100, Number(saved.volume ?? 100)));
    }
  } catch (_) {}

  let audioContext = null;
  let lastClickAt = 0;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (_) {}
    updateUI();
  }
  function context() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioContext) audioContext = new AudioCtx();
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    return audioContext;
  }
  function tone({ frequency = 620, endFrequency = frequency, duration = 0.09, wave = 'sine', gain = 0.16, delay = 0, cutoff = 5000 } = {}) {
    if (!settings.enabled || settings.volume <= 0) return;
    const ctx = context();
    if (!ctx) return;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = wave;
    osc.frequency.setValueAtTime(Math.max(30, frequency), start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFrequency), start + duration);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, start);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain * settings.volume / 100), start + Math.min(0.018, duration / 3));
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(filter); filter.connect(amp); amp.connect(ctx.destination);
    osc.start(start); osc.stop(start + duration + 0.015);
  }
  const sounds = {
    click() { tone({ frequency: 780, endFrequency: 560, duration: .055, gain: .11 }); },
    open() { tone({ frequency: 440, endFrequency: 760, duration: .12, gain: .12 }); tone({ frequency: 660, endFrequency: 990, duration: .10, gain: .07, delay: .035 }); },
    close() { tone({ frequency: 720, endFrequency: 420, duration: .10, gain: .10 }); },
    success() { tone({ frequency: 523.25, endFrequency: 523.25, duration: .13, gain: .12 }); tone({ frequency: 659.25, endFrequency: 659.25, duration: .15, gain: .12, delay: .08 }); tone({ frequency: 783.99, endFrequency: 1046.5, duration: .20, gain: .13, delay: .16 }); },
    coin() { tone({ frequency: 1046, endFrequency: 1318, duration: .09, gain: .12 }); tone({ frequency: 1568, endFrequency: 1760, duration: .12, gain: .10, delay: .075 }); },
    error() { tone({ frequency: 260, endFrequency: 185, duration: .18, wave: 'triangle', gain: .12 }); },
    move() { tone({ frequency: 420, endFrequency: 590, duration: .07, gain: .10 }); },
    attack() { tone({ frequency: 240, endFrequency: 90, duration: .16, wave: 'triangle', gain: .18, cutoff: 2200 }); tone({ frequency: 110, endFrequency: 70, duration: .12, wave: 'sine', gain: .12, delay: .035 }); },
    win() { tone({ frequency: 392, endFrequency: 392, duration: .15, gain: .12 }); tone({ frequency: 523, endFrequency: 523, duration: .15, gain: .12, delay: .10 }); tone({ frequency: 659, endFrequency: 659, duration: .15, gain: .12, delay: .20 }); tone({ frequency: 784, endFrequency: 1046, duration: .28, gain: .13, delay: .30 }); },
    dog() { tone({ frequency: 330, endFrequency: 185, duration: .11, wave: 'triangle', gain: .17 }); tone({ frequency: 260, endFrequency: 145, duration: .10, wave: 'triangle', gain: .15, delay: .13 }); },
    doronum() { tone({ frequency: 880, endFrequency: 1320, duration: .22, gain: .10 }); tone({ frequency: 1760, endFrequency: 2200, duration: .26, gain: .08, delay: .11 }); }
  };
  function play(name = 'click') {
    if (!settings.enabled || settings.volume <= 0) return;
    (sounds[name] || sounds.click)();
  }
  function inferSound(el) {
    const text = (el.getAttribute('aria-label') || el.innerText || el.textContent || '').trim().slice(0, 80);
    if (/오류|실패|취소|잘못|부족/.test(text)) return 'error';
    if (/승리|체크메이트|달성|완료|성공|획득/.test(text)) return 'success';
    if (/코인|구매|보상|판매|매수|매도/.test(text)) return 'coin';
    if (/공격|전투|스킬|타격/.test(text)) return 'attack';
    if (/열기|메뉴|설정|시작|다음/.test(text)) return 'open';
    if (/닫기|뒤로|취소/.test(text)) return 'close';
    return 'click';
  }
  document.addEventListener('click', (event) => {
    const el = event.target?.closest?.('button, a, [role="button"], input[type="button"], input[type="submit"]');
    if (!el || el.closest('#dori-sound-panel') || el.id === 'dori-sound-toggle' || el.dataset.soundIgnore === 'true') return;
    const now = performance.now();
    if (now - lastClickAt < 35) return;
    lastClickAt = now;
    play(inferSound(el));
  }, true);

  document.addEventListener('dori:sound', (event) => {
    const name = typeof event.detail === 'string' ? event.detail : event.detail?.name;
    if (name) play(name);
  });

  const style = document.createElement('style');
  style.textContent = `
    #dori-sound-widget{position:fixed;right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));z-index:2147483000;font-family:inherit;color:#f5f7ff}
    #dori-sound-toggle{display:flex;align-items:center;gap:9px;border:1px solid rgba(170,190,255,.27);border-radius:999px;padding:10px 15px;background:linear-gradient(135deg,rgba(19,28,72,.96),rgba(5,8,28,.96));box-shadow:0 8px 30px rgba(0,0,0,.28),inset 0 1px rgba(255,255,255,.09);color:inherit;font:600 13px/1.2 inherit;cursor:pointer;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);transition:transform .2s ease,border-color .2s ease}
    #dori-sound-toggle:hover{transform:translateY(-2px);border-color:rgba(150,170,255,.65)}
    #dori-sound-toggle:focus-visible,#dori-sound-panel button:focus-visible,#dori-sound-panel input:focus-visible{outline:2px solid #aabaff;outline-offset:3px}
    #dori-sound-led{width:7px;height:7px;border-radius:50%;background:#65e6b0;box-shadow:0 0 12px rgba(101,230,176,.8)}
    #dori-sound-widget[data-off="true"] #dori-sound-led{background:#8790a8;box-shadow:none}
    #dori-sound-panel{position:absolute;right:0;bottom:calc(100% + 10px);width:min(290px,calc(100vw - 28px));padding:17px;border:1px solid rgba(170,190,255,.22);border-radius:19px;background:linear-gradient(145deg,rgba(18,25,62,.98),rgba(5,8,26,.98));box-shadow:0 20px 60px rgba(0,0,0,.42);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);transform-origin:bottom right;animation:doriSoundIn .18s ease-out}
    #dori-sound-panel[hidden]{display:none}
    #dori-sound-panel .ds-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:15px}
    #dori-sound-panel .ds-title{font-size:15px;font-weight:750;letter-spacing:.02em}
    #dori-sound-panel .ds-sub{font-size:11px;color:#aeb9da;margin-top:4px}
    #dori-sound-panel .ds-row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:14px 0;font-size:13px}
    #dori-sound-panel .ds-volume{display:flex;align-items:center;gap:10px;margin-top:9px}
    #dori-sound-panel input[type=range]{width:100%;accent-color:#9aaaff;cursor:pointer}
    #dori-sound-panel .ds-value{min-width:42px;text-align:right;font-variant-numeric:tabular-nums;color:#dbe2ff}
    #dori-sound-panel .ds-switch{position:relative;width:42px;height:24px;flex:none}
    #dori-sound-panel .ds-switch input{position:absolute;opacity:0;width:1px;height:1px}
    #dori-sound-panel .ds-track{position:absolute;inset:0;border-radius:999px;background:#3b4260;transition:background .18s;cursor:pointer}
    #dori-sound-panel .ds-track:after{content:"";position:absolute;left:3px;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .18s}
    #dori-sound-panel .ds-switch input:checked+.ds-track{background:#777ff7}
    #dori-sound-panel .ds-switch input:checked+.ds-track:after{transform:translateX(18px)}
    #dori-sound-panel .ds-test{width:100%;margin-top:8px;padding:10px 12px;border:1px solid rgba(160,180,255,.25);border-radius:11px;background:rgba(130,145,255,.12);color:#f5f7ff;font:inherit;font-size:12px;cursor:pointer}
    #dori-sound-panel .ds-test:hover{background:rgba(130,145,255,.22)}
    @keyframes doriSoundIn{from{opacity:0;transform:translateY(5px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
    @media(max-width:480px){#dori-sound-toggle{padding:11px 13px;font-size:12px}#dori-sound-panel{padding:15px}}
    @media(prefers-reduced-motion:reduce){#dori-sound-toggle{transition:none}#dori-sound-panel{animation:none}}
  `;
  document.head.appendChild(style);

  const widget = document.createElement('div');
  widget.id = 'dori-sound-widget';
  widget.innerHTML = `
    <section id="dori-sound-panel" hidden aria-label="효과음 설정">
      <div class="ds-head"><div><div class="ds-title">사운드 컨트롤</div><div class="ds-sub">DORI DIGITAL AUDIO</div></div><span aria-hidden="true">✦</span></div>
      <div class="ds-row"><span>효과음 켜기</span><label class="ds-switch"><input id="dori-sound-enabled" type="checkbox" aria-label="효과음 켜기"><span class="ds-track"></span></label></div>
      <div class="ds-row"><label for="dori-sound-volume">기본 음량</label><span id="dori-sound-volume-value" class="ds-value">100%</span></div>
      <div class="ds-volume"><span aria-hidden="true">低</span><input id="dori-sound-volume" type="range" min="0" max="100" step="1" value="100" aria-label="효과음 음량"><span aria-hidden="true">高</span></div>
      <button id="dori-sound-test" class="ds-test" type="button">♪ 사운드 미리 듣기</button>
    </section>
    <button id="dori-sound-toggle" type="button" aria-expanded="false" aria-controls="dori-sound-panel"><span id="dori-sound-led"></span><span id="dori-sound-toggle-label">효과음 켜짐</span><span aria-hidden="true">⌄</span></button>
  `;
  document.body.appendChild(widget);
  const panel = widget.querySelector('#dori-sound-panel');
  const toggle = widget.querySelector('#dori-sound-toggle');
  const enabledInput = widget.querySelector('#dori-sound-enabled');
  const volumeInput = widget.querySelector('#dori-sound-volume');
  const volumeValue = widget.querySelector('#dori-sound-volume-value');
  const toggleLabel = widget.querySelector('#dori-sound-toggle-label');

  function updateUI() {
    if (!widget.isConnected) return;
    enabledInput.checked = settings.enabled;
    volumeInput.value = String(settings.volume);
    volumeValue.textContent = settings.volume + '%';
    toggleLabel.textContent = settings.enabled ? '효과음 켜짐' : '효과음 꺼짐';
    toggle.setAttribute('aria-label', settings.enabled ? '효과음 설정 열기, 현재 켜짐' : '효과음 설정 열기, 현재 꺼짐');
    widget.dataset.off = String(!settings.enabled);
    volumeInput.disabled = !settings.enabled;
  }
  toggle.addEventListener('click', () => {
    const opening = panel.hidden;
    panel.hidden = !opening;
    toggle.setAttribute('aria-expanded', String(opening));
    if (opening) play('open'); else play('close');
  });
  enabledInput.addEventListener('change', () => {
    settings.enabled = enabledInput.checked;
    save();
    if (settings.enabled) play('success');
  });
  volumeInput.addEventListener('input', () => {
    settings.volume = Number(volumeInput.value);
    save();
  });
  widget.querySelector('#dori-sound-test').addEventListener('click', () => {
    if (!settings.enabled) {
      settings.enabled = true;
      save();
    }
    play('success');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
  updateUI();

  window.DoriSound = Object.freeze({
    play,
    setEnabled(value) { settings.enabled = Boolean(value); save(); },
    setVolume(value) { settings.volume = Math.max(0, Math.min(100, Number(value) || 0)); save(); },
    getSettings() { return { ...settings }; }
  });
})();