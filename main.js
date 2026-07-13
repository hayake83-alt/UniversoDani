/* ===========================================================
   UNIVERSO PARA DANI â¤ï¸
   Script Principal Restaurado e Integrado
   Optimizado para ejecuciÃ³n local y tÃ¡ctil en Acode
   =========================================================== */

/* ===========================================================
   CONFIGURACIÃ“N Y PALETA DE COLORES (TikTok Regalo de Galaxia)
   =========================================================== */
const CONFIG = {
    totalStars: 28000,
    interactiveStarsCount: 150,
    dustCount: 6000,
    cometCount: 8,
    galaxyRadius: 1600
};

const PALETTE = {
    blue: 0x2288ff,
    deepSpace: 0x050510,
    violet: 0x8d63ff,
    pink: 0xff3f9b,
    red: 0xff2d55,
    white: 0xffffff,
    starGlow: 0xfff6e0
};

/* ===========================================================
   VARIABLES GLOBALES DEL MOTOR ORIGINAL
   =========================================================== */
const canvas = document.getElementById("universo");
const loader = document.getElementById("loader");

let scene, camera, renderer, controls, clock, raycaster, mouse;
let elapsedTime = 0;

// Estructura de Grupos Original
const mainUniverseGroup = new THREE.Group();
const starfieldGroup = new THREE.Group();
const interactiveGroup = new THREE.Group();
const nebulaGalaxyGroup = new THREE.Group();
const planetarySystemGroup = new THREE.Group();
const spaceEffectsGroup = new THREE.Group();

// Arrays de Control de AnimaciÃ³n
const activeNebulas = [];
const activePlanets = [];
const activeComets = [];
const interactiveMeshes = [];
const burstParticleSystems = [];

// Utilitarios
const getRand = (min, max) => Math.random() * (max - min) + min;
const getRandInt = (min, max) => Math.floor(getRand(min, max + 1));

/* ===========================================================
   MOTOR PRINCIPAL
   =========================================================== */
function setupCoreEngine() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(PALETTE.deepSpace);
    scene.fog = new THREE.FogExp2(PALETTE.deepSpace, 0.00016);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 9000);
    camera.position.set(0, 20, 220); // PosiciÃ³n cinemÃ¡tica original inicial

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false; 
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.06; // RotaciÃ³n lenta inmersiva
    controls.minPolarAngle = Math.PI * 0.32;
    controls.maxPolarAngle = Math.PI * 0.68;

    clock = new THREE.Clock();
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    scene.add(mainUniverseGroup);
    mainUniverseGroup.add(starfieldGroup, interactiveGroup, nebulaGalaxyGroup, planetarySystemGroup, spaceEffectsGroup);

    // IluminaciÃ³n CÃ³smica Avanzada
    const lightAmbient = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(lightAmbient);

    const directionalAcento = new THREE.DirectionalLight(PALETTE.starGlow, 0.85);
    directionalAcento.position.set(150, 120, 60);
    scene.add(directionalAcento);

    // Eventos e Interacciones TÃ¡ctiles MÃ³viles
    window.addEventListener("resize", onWindowResize);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("click", onUniverseClick);
    window.addEventListener("touchstart", onUniverseTouch, { passive: false });
}

/* ===========================================================
   MÃ“DULOS DE CREACIÃ“N DE OBJETOS CÃ“SMICOS
   =========================================================== */
function createStars() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    const coreColors = [
        new THREE.Color(PALETTE.white),
        new THREE.Color(PALETTE.blue),
        new THREE.Color(PALETTE.pink),
        new THREE.Color(PALETTE.violet)
    ];

    for (let i = 0; i < CONFIG.totalStars; i++) {
        const radius = Math.pow(Math.random(), 0.55) * CONFIG.galaxyRadius;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(getRand(-1, 1));

        positions.push(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta) * 0.45, // Factor de aplanamiento original
            radius * Math.cos(phi)
        );

        const selectedColor = coreColors[getRandInt(0, coreColors.length - 1)];
        colors.push(selectedColor.r, selectedColor.g, selectedColor.b);
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 2.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const starFieldPoints = new THREE.Points(geometry, material);
    starfieldGroup.add(starFieldPoints);
}

// NUEVO: Sistema de Estrellas Interactivas Sorpresa para TikTok
function createInteractiveStars() {
    const geometry = new THREE.SphereGeometry(2.8, 8, 8); // Esferas Ã³ptimas para click tÃ¡ctil
    const material = new THREE.MeshBasicMaterial({
        color: PALETTE.white,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < CONFIG.interactiveStarsCount; i++) {
        const meshStar = new THREE.Mesh(geometry, material.clone());
        meshStar.position.set(getRand(-400, 400), getRand(-130, 130), getRand(-300, 300));
        
        meshStar.userData = {
            baseScale: getRand(0.6, 1.4),
            twinkleSpeed: getRand(2.0, 4.0),
            isInteracting: false
        };
        meshStar.scale.setScalar(meshStar.userData.baseScale);
        
        interactiveGroup.add(meshStar);
        interactiveMeshes.push(meshStar);
    }
}

function triggerStarInteraction(star) {
    if (star.userData.isInteracting) return;
    star.userData.isInteracting = true;

    star.material.color.set(PALETTE.starGlow);
    star.scale.setScalar(star.userData.baseScale * 4.5);

    // ExplosiÃ³n de brillos tridimensional
    generateCosmicBurst(star.position);

    setTimeout(() => {
        star.material.color.set(PALETTE.white);
        star.scale.setScalar(star.userData.baseScale);
        star.userData.isInteracting = false;
    }, 750);
}

function generateCosmicBurst(position) {
    const pCount = 40;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(pCount * 3);
    const velocities = [];

    for (let i = 0; i < pCount; i++) {
        positions[i * 3] = position.x;
        positions[i * 3 + 1] = position.y;
        positions[i * 3 + 2] = position.z;

        velocities.push(new THREE.Vector3(getRand(-2.2, 2.2), getRand(-2.2, 2.2), getRand(-2.2, 2.2)));
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: getRand(5, 9),
            transparent: true,
            opacity: 0.065,
            vertexColors: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const nebulaField = new THREE.Points(geometry, material);
        nebulaField.position.copy(cfg.pos);
        nebulaGalaxyGroup.add(nebulaField);
        activeNebulas.push(nebulaField);
    });
}

function createPlanets() {
    // Planeta Estilo TikTok Violeta Profundo original
    const geometry = new THREE.SphereGeometry(22, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: PALETTE.violet,
        emissive: 0x15002b,
        roughness: 0.55,
        metalness: 0.2
    });
    const planetMesh = new THREE.Mesh(geometry, material);
    planetMesh.position.set(-220, -25, -280);
    planetarySystemGroup.add(planetMesh);
    activePlanets.push(planetMesh);

    // Sistema de anillos majestuosos rojos/blancos
    const ringGeo = new THREE.RingGeometry(28, 45, 32);
    const ringMat = new THREE.MeshBasicMaterial({
        color: PALETTE.red,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.1;
    planetMesh.add(ringMesh);
}

function createComets() {
    // SimulaciÃ³n integrada de los cometas de tu cÃ³digo gigante original
    for (let i = 0; i < CONFIG.cometCount; i++) {
        const geometry = new THREE.SphereGeometry(1.2, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: PALETTE.white });
        const comet = new THREE.Mesh(geometry, material);
        
        resetCometPosition(comet);
        planetarySystemGroup.add(comet);
        activeComets.push(comet);
    }
}

function resetCometPosition(comet) {
    comet.position.set(getRand(-600, 600), getRand(200, 400), getRand(-500, 200));
    comet.userData = {
        speed: getRand(3, 6),
        vector: new THREE.Vector3(getRand(-1.5, -0.5), getRand(-1.0, -0.5), getRand(-0.5, 0.5)).normalize()
    };
}

function createCosmicDust() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < CONFIG.dustCount; i++) {
        positions.push(getRand(-900, 900), getRand(-450, 450), getRand(-900, 900));
    }
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: PALETTE.blue,
        size: 1.1,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const dustPoints = new THREE.Points(geometry, material);
    spaceEffectsGroup.add(dustPoints);
}

/* ===========================================================
   CONTROL DE ANIMACIONES DE TEXTOS Y AURORAS (CORS-SAFE)
   =========================================================== */
function initTextSequences() {
    const dani = document.getElementById("nombre-dani");
    const cumple = document.getElementById("mensaje-cumple");

    // Secuencias temporizadas estables
    setTimeout(() => {
        dani.style.opacity = "1";
        dani.style.transform = "scale(1.05)";
    }, 1600);

    setTimeout(() => {
        cumple.style.opacity = "1";
        cumple.style.transform = "scale(1.02)";
    }, 3600);

    // Desvanecimiento controlado (Efecto aurora escapando)
    setTimeout(() => {
        cumple.style.opacity = "0";
        cumple.style.transform = "translateY(-25px) scale(0.95)";
    }, 8000);
}

/* ===========================================================
   CICLO DE ANIMACIÃ“N Y RENDERIZADO COMPLETO
   =========================================================== */
function animateUniverse() {
    requestAnimationFrame(animateUniverse);
    
    const delta = clock.getDelta();
    elapsedTime = clock.getElapsedTime();

    controls.update();

    // 1. Destellos y temblor fÃ­sico en Estrellas Interactivas
    interactiveMeshes.forEach(star => {
        const twinkle = 1 + Math.sin(elapsedTime * star.userData.twinkleSpeed) * 0.18;
        if (star.userData.isInteracting) {
            star.position.x += (Math.random() - 0.5) * 0.35;
            star.position.y += (Math.random() - 0.5) * 0.35;
        } else {
            star.scale.setScalar(star.userData.baseScale * twinkle);
        }
    });

    // 2. DinÃ¡mica de Explosiones de Brillos (Bursts)
    for (let i = burstParticleSystems.length - 1; i >= 0; i--) {
        const burst = burstParticleSystems[i];
        const uData = burst.userData;
        const positions = burst.geometry.attributes.position;
        
        uData.lifespan -= delta * 1.25;
        burst.material.opacity = uData.lifespan;

        for (let j = 0; j < positions.count; j++) {
            positions.array[j * 3] += uData.velocities[j].x;
            positions.array[j * 3 + 1] += uData.velocities[j].y;
            positions.array[j * 3 + 2] += uData.velocities[j].z;
        }
        positions.needsUpdate = true;

        if (uData.lifespan <= 0) {
            spaceEffectsGroup.remove(burst);
            burstParticleSystems.splice(i, 1);
        }
    }

    // 3. RotaciÃ³n majestuosa de Nebulosas
    activeNebulas.forEach((nebula, idx) => {
        nebula.rotation.y += delta * (0.012 + idx * 0.003);
    });

    // 4. AnimaciÃ³n e inclinaciÃ³n de Cometas del cÃ³digo original
    activeComets.forEach(comet => {
        comet.position.addScaledVector(comet.userData.vector, comet.userData.speed);
        if (comet.position.y < -300 || comet.position.x < -700) {
            resetCometPosition(comet);
        }
    });

    // 5. RotaciÃ³n de Planetas
    activePlanets.forEach(p => {
        p.rotation.y += delta * 0.07;
    });

    renderer.render(scene, camera);
}

/* ===========================================================
   GESTIÃ“N DE EVENTOS TÃCTILES Y RAYCASTER
   =========================================================== */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function processRaycastSelection() {
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(interactiveMeshes);
    if (hits.length > 0) {
        triggerStarInteraction(hits[0].object);
    }
}

function onUniverseClick(event) {
    processRaycastSelection();
}

function onUniverseTouch(event) {
    if(event.touches.length > 0) {
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
        processRaycastSelection();
        event.preventDefault(); 
    }
}

/* ===========================================================
   INTRODUCCIÃ“N CINEMÃTICA Y LANZAMIENTO ORIGINAL
   =========================================================== */
function runCinematicIntro() {
    const duration = 4500;
    const startCamZ = 550;
    const endCamZ = 220;
    let startTimestamp = null;

    function frame(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        const timelineProgress = Math.min((timestamp - startTimestamp) / duration, 1);
        const smoothEasing = 1 - Math.pow(1 - timelineProgress, 3); // cubic ease-out
        
        camera.position.z = startCamZ - (startCamZ - endCamZ) * smoothEasing;

        if (timelineProgress < 1) {
            requestAnimationFrame(frame);
        } else {
            if (loader) loader.style.display = 'none';
        }
    }

    requestAnimationFrame(frame);
    initTextSequences();
    animateUniverse();
          }
      // InicializaciÃ³n final coordinada
window.onload = () => {
    setupCoreEngine();
    createStars();
    createInteractiveStars();
    createNebulas();
    createPlanets();
    createComets();
    createCosmicDust();
    
    runCinematicIntro();
    console.log("ðŸŒŒ Gran Universo para Dani inicializado con Ã©xito.");
};
    
