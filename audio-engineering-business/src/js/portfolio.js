document.querySelectorAll('.artist-circle').forEach(circle => {
  const audio = circle.querySelector('audio');

  // Create an AudioContext for each artist
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const track = audioContext.createMediaElementSource(audio);

  // Create a compressor (works like a limiter)
  const compressor = audioContext.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-3, audioContext.currentTime); // start limiting above -3dB
  compressor.knee.setValueAtTime(0, audioContext.currentTime);        // hard knee
  compressor.ratio.setValueAtTime(20, audioContext.currentTime);      // high ratio = limiter
  compressor.attack.setValueAtTime(0.003, audioContext.currentTime);  // fast attack
  compressor.release.setValueAtTime(0.25, audioContext.currentTime);  // quick release

  // Connect everything: track -> compressor -> destination
  track.connect(compressor);
  compressor.connect(audioContext.destination);

  // Lower the base volume just in case
  audio.volume = 0.8;

  circle.addEventListener('mouseenter', () => {
    audio.currentTime = 0;
    audio.play();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  });

  circle.addEventListener('mouseleave', () => {
    audio.pause();
    audio.currentTime = 0;
  });
});

// Portfolio.js
// Handles audio playback on hover for artist circles

// Select all artist circles
// Add event listeners for mouseenter and mouseleave
// Play the associated audio on hover, pause and reset on leave

// End of portfolio.js
