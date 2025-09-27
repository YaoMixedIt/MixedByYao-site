// js/portfolio.js
document.addEventListener('DOMContentLoaded', () => {
  let audioContext = null;
  const cards = Array.from(document.querySelectorAll('.artist-card'));

  // helper to stop all playing audio + clear .playing
  function stopAll() {
    document.querySelectorAll('audio').forEach(a => {
      try { a.pause(); a.currentTime = 0; } catch(e){}
    });
    cards.forEach(c => c.classList.remove('playing'));
  }

  async function ensureAudioSetup(audio) {
    if (audio._isSetup) return;
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    // create media element source (one per audio element)
    const source = audioContext.createMediaElementSource(audio);

    // create compressor (acts like a limiter)
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-3, audioContext.currentTime);
    compressor.knee.setValueAtTime(0, audioContext.currentTime);
    compressor.ratio.setValueAtTime(20, audioContext.currentTime);
    compressor.attack.setValueAtTime(0.003, audioContext.currentTime);
    compressor.release.setValueAtTime(0.25, audioContext.currentTime);

    source.connect(compressor);
    compressor.connect(audioContext.destination);

    audio._isSetup = true;
    audio._source = source;
    audio._compressor = compressor;
  }

  cards.forEach(card => {
    const audio = card.querySelector('audio');
    const equalizerBars = card.querySelectorAll('.equalizer span');

    // Prevent browser autoplay policies from causing issues:
    // on first user interaction we can resume the context if needed.

    // hover start (desktop)
    card.addEventListener('mouseenter', async () => {
      await handleStart(card, audio);
    });

    // hover end
    card.addEventListener('mouseleave', () => {
      handleStop(card, audio);
    });

    // keyboard accessibility: Enter or Space toggles play
    card.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (audio.paused) await handleStart(card, audio);
        else handleStop(card, audio);
      }
    });

    // click/tap toggles (useful for mobile)
    card.addEventListener('click', async (e) => {
      // ignore click if user used hover-based start on desktop
      if (audio.paused) await handleStart(card, audio);
      else handleStop(card, audio);
    });

    // helper functions
    async function handleStart(cardEl, audioEl) {
      try {
        await ensureAudioSetup(audioEl);
        stopAll();
        // resume context if suspended (user gesture)
        if (audioContext && audioContext.state === 'suspended') {
          try { await audioContext.resume(); } catch(e) {}
        }
        audioEl.volume = 0.9;
        audioEl.currentTime = 0;
        await audioEl.play().catch(() => { /* fail silently */ });
        cardEl.classList.add('playing');
      } catch (err) {
        console.warn('Playback start error:', err);
      }
    }

    function handleStop(cardEl, audioEl) {
      try {
        audioEl.pause();
        audioEl.currentTime = 0;
      } catch(e) {}
      cardEl.classList.remove('playing');
    }
  });

  // ensure that when navigation or other events would start playback elsewhere, all audio stops:
  window.addEventListener('pagehide', stopAll);
});
