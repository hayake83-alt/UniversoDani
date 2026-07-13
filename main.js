/* ===========================================================
   UNIVERSO PARA DANI â¤ï¸
   CÃ³digo Original Restaurado, Reordenado y Corregido
   =========================================================== */

/* ===========================================================
   1. CONFIGURACIÃ“N Y PALETAS (Movidos al inicio para evitar errores)
   =========================================================== */
const SETTINGS = {
    stars: 18000,
    interactiveStars: 150,
    nebulas: 8,
    planets: 7,
    comets: 5,
    particles: 3500,
    galaxyRadius: 1300
};

const COLORS = {
    blue: 0x6da8ff,
    violet: 0x8d63ff,
    red: 0xff5d7d,
    white: 0xffffff,
    moon: 0xe7ecff,
    deep: 0x050510,
    starGlow: 0xfff6e0
};

/* ===========================================================
   2. ELEMENTOS DEL HTML Y MOTOR
   =========================================================== */
const canvas = document.getElementById("universo");
const loader = document.getElementById("loader");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(COLORS.deep, 0.00018);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 6000);
camera.position.set(0, 20, 220); // PosiciÃ³n inicial de tu animaciÃ³n cinemÃ¡tica

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

/* ===========================================================
   3. ILUMINACIÃ“N ORIGINAL
   =========================================================== */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambientLight);

const blueLight = new THREE.PointLight(COLORS.blue, 45, 1800);
blueLight.position.set(-250, 140, 180);
scene.add(blueLight);

const redLight = new THREE.PointLight(COLORS.red, 38, 1800);
redLight.position.set(260, -120, -200);
scene.add(redLight);

const violetLight = new THREE.PointLight(COLORS.violet, 40, 1800);
violetLight.position.set(-120, -220, -420);
scene.add(violetLight);

const moonLight = new THREE.DirectionalLight(COLORS.moon, 1.4);
moonLight.position.set(150, 240, 90);
scene.add(moonLight);

/* ===========================================================
   4. GRUPOS Y ARRAYS GLOBALES ORIGINALES
   =========================================================== */
const universe = new THREE.Group();
const starsGroup = new THREE.Group();
const nebulaGroup = new THREE.Group();
const planetsGroup = new THREE.Group();
const particlesGroup = new THREE.Group();
const cometsGroup = new THREE.Group();
const effectsGroup = new THREE.Group();

scene.add(universe);
universe.add(starsGroup, nebulaGroup, planetsGroup, particlesGroup, cometsGroup, effectsGroup);

const stars = [];
const interactiveMeshes = []; // Array optimizado para las estrellas tÃ¡ctiles
const nebulas = [];
const shaderNebulas = [];
const planets = [];
const particles = [];
const comets = [];
const shootingStars = [];
const burstParticleSystems = [];

let elapsedTime = 0;
const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableZoom = false;
controls.enableDamping = true;
controls.dampingFactor = 0.04;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.05;
controls.minPolarAngle = Math.PI * 0.35;
controls.maxPolarAngle = Math.PI * 0.65;

/* ===========================================================
   5. FUNCIONES AUXILIARES ORIGINALES
   =========================================================== */
function random(min, max) { return Math.random() * (max - min) + min; }
function randomInt(min, max) { return Math.floor(random(min, max + 1)); }
function lerp(start, end, amount) { return start + (end - start) * amount; }

/* ===========================================================
   6. MÃ“DULOS DE CREACIÃ“N CELESTE
   =========================================================== */
function createStars() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const colorPalette = [
        new THREE.Color(0xffffff), new THREE.Color(0x9ecbff),
        new THREE.Color(0xffc7d8), new THREE.Color(0xd8c5ff), new THREE.Color(0xff8fa3)
    ];

    for (let i = 0; i < SETTINGS.stars; i++) {
        const radius = Math.pow(Math.random(), 0.55) * SETTINGS.galaxyRadius;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(random(-1, 1));

        positions.push(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );

        const starColor = colorPalette[randomInt(0, colorPalette.length - 1)];
        colors.push(starColor.r, starColor.g, starColor.b);
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 1.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const starField = new THREE.Points(geometry, material);
    starsGroup.add(starField);
    stars.push(starField);
}

// NUEVO: Estrellas mÃ¡gicas interactivas integradas en el entorno fÃ­sico
function createInteractiveStarPoints() {
    const geometry = new THREE.SphereGeometry(3, 8, 8);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < SETTINGS.interactiveStars; i++) {
        const meshStar = new THREE.Mesh(geometry, material.clone());
        meshStar.position.set(random(-500, 500), random(-150, 150), random(-400, 400));
        
        meshStar.userData = {
            baseScale: random(0.5, 1.5),
            twinkleSpeed: random(1.8, 3.8),
            isInteracting: false
        };
        meshStar.scale.setScalar(meshStar.userData.baseScale);
        
        effectsGroup.add(meshStar);
        interactiveMeshes.push(meshStar);
    }
}

function createGalaxySpiral() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const starColors = [
        new THREE.Color(0x4d8cff), new THREE.Color(0xff5577),
        new THREE.Color(0xb26cff), new THREE.Color(0xffffff)
    ];

    const arms = 4;
    const totalStars = 7000;

    for (let i = 0; i < totalStars; i++) {
        const radius = Math.random() * 900;
        const arm = i % arms;
        const angle = (arm / arms) * Math.PI * 2 + radius * 0.004;
        const spread = random(-25, 25);

        positions.push(
            Math.cos(angle) * radius + spread,
            random(-40, 40),
            Math.sin(angle) * radius + spread
        );

        const color = starColors[randomInt(0, starColors.length - 1)];
        colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const galaxy = new THREE.Points(geometry, material);
    nebulaGroup.add(galaxy);
}

function createGalaxyCore() {
    const geometry = new THREE.SphereGeometry(60, 64, 64);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffb6ff,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending
    });
    const core = new THREE.Mesh(geometry, material);
    nebulaGroup.add(core);
}

function createNebula(color, position, size, particleCount) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const nebulaColor = new THREE.Color(color);

    for (let i = 0; i < particleCount; i++) {
        const radius = Math.pow(Math.random(), 1.8) * size;
        const angle = Math.random() * Math.PI * 2;
        const height = random(-size * 0.35, size * 0.35);

        positions.push(
            Math.cos(angle) * radius + random(-15, 15),
            height + Math.sin(angle) * radius * 0.35,
            Math.sin(angle) * radius
        );

        const variation = random(0.55, 1);
        colors.push(nebulaColor.r * variation, nebulaColor.g * variation, nebulaColor.b * variation);
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: random(2, 5),
        transparent: true,
        opacity: 0.12,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const nebula = new THREE.Points(geometry, material);
    nebula.position.copy(position);
    nebulaGroup.add(nebula);
    nebulas.push(nebula);
}

function createNebulas() {
    createNebula(COLORS.red, new THREE.Vector3(-350, 120, -300), 350, 900);
    createNebula(COLORS.blue, new THREE.Vector3(300, -80, -450), 420, 1100);
    createNebula(COLORS.violet, new THREE.Vector3(0, 250, -700), 500, 1400);
    createNebula(0xff3f9b, new THREE.Vector3(450, 100, 200), 300, 700);
}

function createShaderNebula() {
    const geometry = new THREE.PlaneGeometry(900, 900, 128, 128);
    const material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
            uTime: { value: 0 },
            uColor1: { value: new THREE.Color(0xff3366) },
            uColor2: { value: new THREE.Color(0x6644ff) },
            uColor3: { value: new THREE.Color(0x2288ff) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main(){
                vUv = uv;
                vec3 pos = position;
                pos.z += sin(pos.x * 0.01 + pos.y * 0.01) * 20.0;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform vec3 uColor1; uniform vec3 uColor2; uniform vec3 uColor3;
            varying vec2 vUv;
            void main(){
                float wave = sin(vUv.x * 8.0 + uTime);
                vec3 color = mix(uColor1, uColor2, wave);
                color = mix(color, uColor3, vUv.y);
                float alpha = 0.25 * sin(vUv.x * 3.14);
                gl_FragColor = vec4(color, alpha);
            }
        `
    });

    const nebula = new THREE.Mesh(geometry, material);
    nebula.rotation.x = -Math.PI / 2;
    nebula.position.z = -500;
    nebulaGroup.add(nebula);
    shaderNebulas.push(nebula);
}

function createPlanet(options) {
    const geometry = new THREE.SphereGeometry(options.size, 64, 64);
    const material = new THREE.MeshStandardMaterial({
        color: options.color,
        emissive: options.color,
        emissiveIntensity: 0.5,
        roughness: 0.35,
        metalness: 0.15
    });

    const planet = new THREE.Mesh(geometry, material);
    planet.position.copy(options.position);

    const glowGeometry = new THREE.SphereGeometry(options.size * 1.35, 64, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: options.color,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    planet.add(glow);

    planet.userData = { rotationSpeed: options.rotationSpeed || 0.002 };
    planetsGroup.add(planet);
    planets.push(planet);
    return planet;
}

function addRing(planet) {
    const geometry = new THREE.RingGeometry(planet.geometry.parameters.radius * 1.5, planet.geometry.parameters.radius * 2.2, 96);
    const material = new THREE.MeshBasicMaterial({
        color: 0xd7c8ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55
    });
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = Math.PI / 2.5;
    planet.add(ring);
}

function createMoon(parent) {
    const moonGroup = new THREE.Group();
    const geometry = new THREE.SphereGeometry(4, 48, 48);
    const material = new THREE.MeshStandardMaterial({ color: 0xcfd7ff, roughness: 1 });
    const moon = new THREE.Mesh(geometry, material);
    
    moon.position.x = 32;
    moonGroup.add(moon);
    parent.add(moonGroup);
    moonGroup.userData = { orbitSpeed: 0.004 };
    planets.push(moonGroup);
}

function createComet() {
    const cometGroup = new THREE.Group();
    const headGeo = new THREE.SphereGeometry(2.5, 32, 32);
    const headMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const head = new THREE.Mesh(headGeo, headMat);
    cometGroup.add(head);

    const tailGeo = new THREE.BufferGeometry();
    const tailPositions = [];
    for (let i = 0; i < 80; i++) {
        tailPositions.push(-i * 1.8, random(-0.8, 0.8), random(-0.8, 0.8));
    }
    tailGeo.setAttribute("position", new THREE.Float32BufferAttribute(tailPositions, 3));

    const tailMat = new THREE.PointsMaterial({
        color: 0x9ecbff, size: 1.5, transparent: true, opacity: 0.65,
        blending: THREE.AdditiveBlending, depthWrite: false
    });
    const tail = new THREE.Points(tailGeo, tailMat);
    cometGroup.add(tail);

    cometGroup.position.set(random(-900, 900), random(-400, 400), random(-1200, -600));
    cometGroup.userData = { velocity: new THREE.Vector3(random(0.4, 1), random(-0.15, 0.15), random(0.1, 0.4)) };

    cometsGroup.add(cometGroup);
    comets.push(cometGroup);
}

function createComets() {
    for (let i = 0; i < SETTINGS.comets; i++) createComet();
}

function createShootingStar() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute([0,0,0, -60,15,0], 3));
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    const line = new THREE.Line(geometry, material);

    line.position.set(random(-600, 600), random(-300, 300), random(-800, -300));
    line.userData = { speed: random(0.8, 2) };
    effectsGroup.add(line);
    shootingStars.push(line);
}

function createCosmicDust() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const dustColors = [new THREE.Color(0x8db8ff), new THREE.Color(0xcbb7ff), new THREE.Color(0xff9fb5), new THREE.Color(0xffffff)];

    for (let i = 0; i < SETTINGS.particles; i++) {
        const radius = random(200, 1400);
        const angle = Math.random() * Math.PI * 2;
        const spread = random(-500, 500);

        positions.push(Math.cos(angle) * radius + spread, random(-600, 600), Math.sin(angle) * radius + spread);
        const color = dustColors[randomInt(0, dustColors.length - 1)];
        colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 1.8, vertexColors: true, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const dust = new THREE.Points(geometry, material);
    particlesGroup.add(dust);
    particles.push(dust);
}

function createLightParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 700; i++) {
        positions.push(random(-900, 900), random(-500, 500), random(-900, 900));
    }
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
        color: 0xffffff, size: 1.2, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const particlesLight = new THREE.Points(geometry, material);
    effectsGroup.add(particlesLight);
    particles.push(particlesLight);
}

/* ===========================================================
   7. DETECTOR DE TOQUES MÃ“VILES (Sorpresa estelar)
   =========================================================== */
function triggerStarInteraction(star) {
    if (star.userData.isInteracting) return;
    star.userData.isInteracting = true;

    star.material.color.set(COLORS.starGlow);
    star.scale.setScalar(star.userData.baseScale * 4.5);

    // Generar rÃ¡faga de chispas tridimensionales
    generateCosmicBurst(star.position);

    setTimeout(() => {
        star.material.color.set(0xffffff);
        star.scale.setScalar(star.userData.baseScale);
        star.userData.isInteracting = false;
    }, 750);
}

function generateCosmicBurst(position) {
    const pCount = 35;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(pCount * 3);
    const velocities = [];

    for (let i = 0; i < pCount; i++) {
        positions[i * 3] = position.x;
        positions[i * 3 + 1] = position.y;
        positions[i * 3 + 2] = position.z;
        velocities.push(new THREE.Vector3(random(-2, 2), random(-2, 2), random(-2, 2)));
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: COLORS.starGlow, size: 2.5, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
    });

    const burstPoints = new THREE.Points(geometry, material);
    burstPoints.userData = { velocities: velocities, lifespan: 1.0 };
    effectsGroup.add(burstPoints);
    burstParticleSystems.push(burstPoints);
}

function processTouchSelection() {
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(interactiveMeshes);
    if (hits.length > 0) {
        triggerStarInteraction(hits[0].object);
    }
}

window.addEventListener("click", () => { processTouchSelection(); });
window.addEventListener("touchstart", (e) => {
    if(e.touches.length > 0) {
        mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        processTouchSelection();
    }
});

/* ===========================================================
   8. BUCLE DE ANIMACIÃ“N COMPLETO (Renderizado unificado)
   =========================================================== */
function animateUniverse() {
    requestAnimationFrame(animateUniverse);
    
    const delta = clock.getDelta();
    elapsedTime = clock.getElapsedTime();

    controls.update();

    // Brillo y temblor fÃ­sico en Estrellas Interactivas
    interactiveMeshes.forEach(star => {
        const twinkle = 1 + Math.sin(elapsedTime * star.userData.twinkleSpeed) * 0.15;
        if (star.userData.isInteracting) {
            star.position.x += (Math.random() - 0.5) * 0.3;
            star.position.y += (Math.random() - 0.5) * 0.3;
        } else {
            star.scale.setScalar(star.userData.baseScale * twinkle);
        }
    });

    // DinÃ¡mica de las chispas (Bursts)
    for (let i = burstParticleSystems.length - 1; i >= 0; i--) {
        const burst = burstParticleSystems[i];
        const uData = burst.userData;
        const positions = burst.geometry.attributes.position;
        
        uData.lifespan -= delta * 1.3;
        burst.material.opacity = uData.lifespan;

        for (let j = 0; j < positions.count; j++) {
            positions.array[j * 3] += uData.velocities[j].x;
            positions.array[j * 3 + 1] += uData.velocities[j].y;
            positions.array[j * 3 + 2] += uData.velocities[j].z;
        }
        positions.needsUpdate = true;

        if (uData.lifespan <= 0) {
            effectsGroup.remove(burst);
            burstParticleSystems.splice(i, 1);
        }
    }

    // RotaciÃ³n de Nebulosas normales y avanzadas con shaders
    nebulas.forEach((nebula, index) => {
        nebula.rotation.y += 0.0003 + index * 0.00005;
        nebula.rotation.x += 0.00008;
    });

    shaderNebulas.forEach(nebula => {
        nebula.material.uniforms.uTime.value = elapsedTime;
    });

    // RotaciÃ³n e inclinaciÃ³n de planetas
    planets.forEach(p => {
        if (p.userData.rotationSpeed) p.rotation.y += p.userData.rotationSpeed;
        if (p.userData.orbitSpeed) p.rotation.y += p.userData.orbitSpeed;
    });

    // Cometas dinÃ¡micos originales
    comets.forEach(comet => {
        comet.position.add(comet.userData.velocity);
        if (comet.position.x > 1000) comet.position.x = -1000;
    });

    // Estrellas fugaces originales
    shootingStars.forEach(star => {
        star.position.x += star.userData.speed;
        if (star.position.x > 800) {
            star.position.x = -800;
            star.position.y = random(-300, 300);
        }
    });

    // Polvo cÃ³smico
    particles.forEach((particle, index) => {
        particle.rotation.y += 0.00015 + index * 0.00002;
        particle.rotation.x += 0.00005;
    });

    renderer.render(scene, camera);
}

/* ===========================================================
   9. INTRODUCCIÃ“N CINEMÃTICA Y SECUENCIAS
   =========================================================== */
function initTextSequences() {
    const dani = document.getElementById("nombre-dani");
    const cumple = document.getElementById("mensaje-cumple");

    setTimeout(() => {
        dani.style.opacity = "1";
        dani.style.transform = "scale(1.05)";
    }, 1500);

    setTimeout(() => {
        cumple.style.opacity = "1";
        cumple.style.transform = "scale(1.02)";
    }, 3500);

    setTimeout(() => {
        cumple.style.opacity = "0";
        cumple.style.transform = "translateY(-20px) scale(0.95)";
    }, 8500);
}

function cinematicStart() {
    const duration = 5000;
    const startPosition = new THREE.Vector3(0, 8, 140);
    const endPosition = new THREE.Vector3(0, 20, 220);
    const startTime = performance.now();

    function cameraIntro(){
        const progress = Math.min((performance.now() - startTime) / duration, 1);
        camera.position.lerpVectors(endPosition, startPosition, progress);

        if(progress < 1){
            requestAnimationFrame(cameraIntro);
        } else {
            if (loader) loader.style.display = 'none';
        }
    }
    cameraIntro();
}

// InicializaciÃ³n final coordinada en orden correcto
window.onload = () => {
    createStars();
    createInteractiveStarPoints();
    createGalaxySpiral();
    createGalaxyCore();
    createNebulas();
    createShaderNebula();

    const planetOne = createPlanet({ name:"Planeta azul", size:18, color:0x2979ff, position:new THREE.Vector3(-230, 40, -450), rotationSpeed:0.0015 });
    const planetTwo = createPlanet({ name:"Planeta rojo", size:12, color:0xff1744, position:new THREE.Vector3(250, -40, -600), rotationSpeed:0.0025 });
    const planetThree = createPlanet({ name:"Planeta violeta", size:25, color:0x9c27ff, position:new THREE.Vector3(100, 180, -900), rotationSpeed:0.001 });
    const planetFour = createPlanet({ name:"Planeta oscuro", size:9, color:0xdde7ff, position:new THREE.Vector3(-500, -130, -700), rotationSpeed:0.003 });

    addRing(planetThree);
    createMoon(planetOne);

    for(let i = 0; i < 3; i++) createShootingStar();
    createComets();
    createCosmicDust();
    createLightParticles();

    cinematicStart();
    initTextSequences();
    animateUniverse();
    
    console.log("ðŸŒŒ Universo completamente integrado y listo.");
};

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
