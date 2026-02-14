/* ============================================
   World of Light — Application
   3D globe with ambient lights, prayer system
   ============================================ */

(function () {
  'use strict';

  // ── Configuration ──────────────────────────
  const CONFIG = {
    initialLightCount: 60,
    globeRadius: 2.2,
    globeSegments: 64,
    rotationSpeed: 0.0008,
    breatheSpeed: 0.3,
    breatheAmplitude: 0.015,
    lightDotSize: 0.04,
    lightDotColor: 0xffdc8c,
    glowColor: 0xffdc8c,
    burstDuration: 2000,
    rippleDuration: 2500,
    cameraDistance: 6.5,
    starCount: 800,
    maxCharCount: 400,
  };

  // ── State ──────────────────────────────────
  let lightCount = CONFIG.initialLightCount;
  let lightDots = [];
  let recentIntentions = [];
  let isAnimating = false;

  // ── Three.js Setup ─────────────────────────
  const container = document.getElementById('canvas-container');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0.8, CONFIG.cameraDistance);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x08080c, 1);
  container.appendChild(renderer.domElement);

  // ── Globe Group ────────────────────────────
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // Planet surface sphere (solid, behind wireframe)
  const planetGeo = new THREE.SphereGeometry(
    CONFIG.globeRadius * 0.995,
    64,
    64
  );
  
  // Create planet material with a simple blue ocean color as base
  const planetMat = new THREE.MeshBasicMaterial({
    color: 0x1a4d7a, // Deep ocean blue
  });
  
  // Try to load Earth texture from a reliable source
  const textureLoader = new THREE.TextureLoader();
  textureLoader.crossOrigin = 'anonymous';
  
  textureLoader.load(
    'https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57752/land_shallow_topo_2048.jpg',
    function(texture) {
      // Success - apply the Earth texture
      planetMat.map = texture;
      planetMat.needsUpdate = true;
    },
    undefined,
    function(error) {
      // Fallback - the material already has a blue color
      // This provides a simple but recognizable planet appearance
      console.log('Using fallback blue planet color');
    }
  );
  
  const planet = new THREE.Mesh(planetGeo, planetMat);
  globeGroup.add(planet);

  // Globe wireframe sphere (on top of planet surface)
  const globeGeo = new THREE.SphereGeometry(
    CONFIG.globeRadius,
    CONFIG.globeSegments,
    CONFIG.globeSegments
  );
  const globeMat = new THREE.MeshBasicMaterial({
    color: 0x1a1a2e,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });
  const globe = new THREE.Mesh(globeGeo, globeMat);
  globeGroup.add(globe);

  // Inner glow sphere
  const innerGlowGeo = new THREE.SphereGeometry(
    CONFIG.globeRadius * 0.98,
    32,
    32
  );
  const innerGlowMat = new THREE.MeshBasicMaterial({
    color: CONFIG.glowColor,
    transparent: true,
    opacity: 0.015,
  });
  const innerGlow = new THREE.Mesh(innerGlowGeo, innerGlowMat);
  globeGroup.add(innerGlow);

  // Outer atmosphere
  const atmosGeo = new THREE.SphereGeometry(
    CONFIG.globeRadius * 1.15,
    32,
    32
  );
  const atmosMat = new THREE.MeshBasicMaterial({
    color: CONFIG.glowColor,
    transparent: true,
    opacity: 0.02,
    side: THREE.BackSide,
  });
  const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
  globeGroup.add(atmosphere);

  // ── Ambient Lighting ───────────────────────
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
  scene.add(ambientLight);

  // ── Stars Background ──────────────────────
  const starsGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(CONFIG.starCount * 3);
  for (let i = 0; i < CONFIG.starCount; i++) {
    const r = 30 + Math.random() * 40;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i * 3 + 2] = r * Math.cos(phi);
  }
  starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starsMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.08,
    transparent: true,
    opacity: 0.4,
  });
  const stars = new THREE.Points(starsGeo, starsMat);
  scene.add(stars);

  // ── Light Dots on Globe ────────────────────
  function createLightDot(lat, lng, intensity) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const r = CONFIG.globeRadius * 1.005;

    const x = -(r * Math.sin(phi) * Math.cos(theta));
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);

    const dotGeo = new THREE.SphereGeometry(
      CONFIG.lightDotSize * (0.8 + Math.random() * 0.4),
      8,
      8
    );
    const dotMat = new THREE.MeshBasicMaterial({
      color: CONFIG.lightDotColor,
      transparent: true,
      opacity: 0.3 + intensity * 0.5,
    });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.set(x, y, z);

    // Store original opacity for breathing
    dot.userData.baseOpacity = dotMat.opacity;
    dot.userData.phaseOffset = Math.random() * Math.PI * 2;

    globeGroup.add(dot);
    lightDots.push(dot);
    return dot;
  }

  function randomLatLng() {
    const lat = Math.random() * 140 - 70;
    const lng = Math.random() * 360 - 180;
    return { lat, lng };
  }

  // Place initial lights
  for (let i = 0; i < CONFIG.initialLightCount; i++) {
    const { lat, lng } = randomLatLng();
    createLightDot(lat, lng, Math.random() * 0.6 + 0.2);
  }

  // ── Ripple Ring ────────────────────────────
  let activeRipples = [];

  function createRipple() {
    const ringGeo = new THREE.RingGeometry(
      CONFIG.globeRadius * 1.2,
      CONFIG.globeRadius * 1.22,
      64
    );
    const ringMat = new THREE.MeshBasicMaterial({
      color: CONFIG.glowColor,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.lookAt(camera.position);
    scene.add(ring);

    const startTime = performance.now();
    activeRipples.push({ ring, startTime, ringMat });
  }

  // ── Burst Particles ────────────────────────
  let activeBursts = [];

  function createBurst(position) {
    const particleCount = 30;
    const burstGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;
      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03
        )
      );
    }
    burstGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    const burstMat = new THREE.PointsMaterial({
      color: CONFIG.lightDotColor,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
    });
    const burst = new THREE.Points(burstGeo, burstMat);
    scene.add(burst);

    const startTime = performance.now();
    activeBursts.push({ burst, burstMat, velocities, startTime });
  }

  // ── Animation Loop ─────────────────────────
  let time = 0;
  let targetRotationSpeed = CONFIG.rotationSpeed;
  let currentRotationSpeed = CONFIG.rotationSpeed;

  function animate() {
    requestAnimationFrame(animate);
    time += 0.016;

    // Globe rotation
    currentRotationSpeed += (targetRotationSpeed - currentRotationSpeed) * 0.02;
    globeGroup.rotation.y += currentRotationSpeed;

    // Breathing effect
    const breathe =
      1 + Math.sin(time * CONFIG.breatheSpeed) * CONFIG.breatheAmplitude;
    globeGroup.scale.set(breathe, breathe, breathe);

    // Light dot pulsing
    for (const dot of lightDots) {
      const phase = time * 0.5 + dot.userData.phaseOffset;
      dot.material.opacity =
        dot.userData.baseOpacity * (0.7 + Math.sin(phase) * 0.3);
    }

    // Stars subtle movement
    stars.rotation.y += 0.00005;
    stars.rotation.x += 0.00002;

    // Update ripples
    const now = performance.now();
    for (let i = activeRipples.length - 1; i >= 0; i--) {
      const rp = activeRipples[i];
      const elapsed = now - rp.startTime;
      const progress = elapsed / CONFIG.rippleDuration;

      if (progress >= 1) {
        scene.remove(rp.ring);
        rp.ring.geometry.dispose();
        rp.ringMat.dispose();
        activeRipples.splice(i, 1);
        continue;
      }

      const scale = 1 + progress * 1.5;
      rp.ring.scale.set(scale, scale, scale);
      rp.ringMat.opacity = 0.25 * (1 - progress);
    }

    // Update bursts
    for (let i = activeBursts.length - 1; i >= 0; i--) {
      const bp = activeBursts[i];
      const elapsed = now - bp.startTime;
      const progress = elapsed / CONFIG.burstDuration;

      if (progress >= 1) {
        scene.remove(bp.burst);
        bp.burst.geometry.dispose();
        bp.burstMat.dispose();
        activeBursts.splice(i, 1);
        continue;
      }

      const posAttr = bp.burst.geometry.getAttribute('position');
      for (let j = 0; j < bp.velocities.length; j++) {
        posAttr.array[j * 3] += bp.velocities[j].x;
        posAttr.array[j * 3 + 1] += bp.velocities[j].y;
        posAttr.array[j * 3 + 2] += bp.velocities[j].z;
        bp.velocities[j].multiplyScalar(0.97);
      }
      posAttr.needsUpdate = true;
      bp.burstMat.opacity = 0.8 * (1 - progress);
    }

    renderer.render(scene, camera);
  }

  animate();

  // ── Window Resize ──────────────────────────
  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener('resize', onResize);
  // For iframe embedding
  if (window.ResizeObserver) {
    new ResizeObserver(onResize).observe(container);
  }

  // ── UI Logic ───────────────────────────────
  const mainPanel = document.getElementById('main-panel');
  const thankYouPanel = document.getElementById('thank-you-panel');
  const recentPanel = document.getElementById('recent-panel');
  const recentList = document.getElementById('recent-list');
  const lightCountNumber = document.getElementById('light-count-number');

  const prayerTypeBtns = document.querySelectorAll('.btn-prayer-type');
  const nameSection = document.getElementById('name-section');
  const emailSection = document.getElementById('email-section');
  const emailToggle = document.getElementById('email-toggle');
  const emailFields = document.getElementById('email-fields');
  const recipientName = document.getElementById('recipient-name');
  const recipientEmail = document.getElementById('recipient-email');
  const prayerText = document.getElementById('prayer-text');
  const charCount = document.getElementById('char-count');
  const submitBtn = document.getElementById('submit-prayer');
  const sendAnotherBtn = document.getElementById('send-another');
  const visibilityRadios = document.querySelectorAll('input[name="visibility"]');

  let currentPrayerType = 'self';

  // Update light count display
  function updateLightCount() {
    lightCountNumber.textContent = lightCount;
  }
  updateLightCount();

  // Prayer type toggle
  prayerTypeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      prayerTypeBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      currentPrayerType = btn.dataset.type;

      if (currentPrayerType === 'other') {
        nameSection.classList.remove('hidden');
        emailSection.classList.remove('hidden');
      } else {
        nameSection.classList.add('hidden');
        emailSection.classList.add('hidden');
        emailToggle.checked = false;
        emailFields.classList.add('hidden');
      }
    });
  });

  // Email toggle
  emailToggle.addEventListener('change', () => {
    if (emailToggle.checked) {
      emailFields.classList.remove('hidden');
    } else {
      emailFields.classList.add('hidden');
    }
  });

  // Character counter
  prayerText.addEventListener('input', () => {
    const count = prayerText.value.length;
    charCount.textContent = count;
  });

  // ── Submission ─────────────────────────────
  submitBtn.addEventListener('click', handleSubmit);

  function handleSubmit() {
    if (isAnimating) return;
    isAnimating = true;

    const visibility = document.querySelector(
      'input[name="visibility"]:checked'
    ).value;
    const text = prayerText.value.trim();
    const name = recipientName.value.trim();

    // Add new light dot
    const { lat, lng } = randomLatLng();
    const newDot = createLightDot(lat, lng, 0.8);
    lightCount++;
    updateLightCount();

    // Trigger burst at new dot position
    const worldPos = new THREE.Vector3();
    newDot.getWorldPosition(worldPos);
    createBurst(worldPos);

    // Create ripple
    createRipple();

    // Increase globe luminosity temporarily
    const origOpacity = innerGlowMat.opacity;
    innerGlowMat.opacity = 0.06;
    setTimeout(() => {
      innerGlowMat.opacity = origOpacity + 0.002; // slight permanent increase
    }, CONFIG.burstDuration);

    // Speed up rotation temporarily
    targetRotationSpeed = CONFIG.rotationSpeed * 3;
    setTimeout(() => {
      targetRotationSpeed = CONFIG.rotationSpeed * 1.1; // slight permanent speed-up
    }, CONFIG.burstDuration);

    // Add to recent intentions if public or anonymous
    if (visibility === 'public' || visibility === 'anonymous') {
      const intention = {
        type: currentPrayerType,
        text: text || '',
        name: visibility === 'public' && name ? name : null,
        visibility: visibility,
        timestamp: Date.now(),
      };
      recentIntentions.unshift(intention);
      // Keep max 20
      if (recentIntentions.length > 20) recentIntentions.pop();
    }

    // Show thank you after burst
    setTimeout(() => {
      mainPanel.classList.add('hidden');
      thankYouPanel.classList.remove('hidden');

      // Show recent panel if there are intentions
      if (recentIntentions.length > 0) {
        renderRecentIntentions();
        recentPanel.classList.remove('hidden');
      }

      isAnimating = false;
    }, 800);
  }

  // ── Render Recent Intentions ───────────────
  function renderRecentIntentions() {
    recentList.innerHTML = '';
    for (const item of recentIntentions) {
      const div = document.createElement('div');
      div.className = 'recent-item';

      const labelText =
        item.type === 'self' ? 'For myself' : 'For someone else';

      let html = '<div class="prayer-label">' + escapeHtml(labelText) + '</div>';

      if (item.text) {
        html +=
          '<div class="prayer-text">' + escapeHtml(item.text) + '</div>';
      }

      if (item.visibility === 'public' && item.name) {
        html +=
          '<div class="prayer-author">— ' + escapeHtml(item.name) + '</div>';
      } else if (item.visibility === 'anonymous') {
        html += '<div class="prayer-author">— Anonymous</div>';
      }

      div.innerHTML = html;
      recentList.appendChild(div);
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  // ── Send Another ───────────────────────────
  sendAnotherBtn.addEventListener('click', () => {
    // Reset form
    prayerText.value = '';
    charCount.textContent = '0';
    recipientName.value = '';
    recipientEmail.value = '';
    emailToggle.checked = false;
    emailFields.classList.add('hidden');

    // Show main panel
    thankYouPanel.classList.add('hidden');
    mainPanel.classList.remove('hidden');
  });
})();
