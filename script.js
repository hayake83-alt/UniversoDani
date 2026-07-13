import * as THREE from "https://unpkg.com/three@0.166.1/build/three.module.js";


/* =========================================================
   ETAPA 2
   Entrada cinematográfica y campo de estrellas
   ========================================================= */


/* ------------------------------
   Elementos del HTML
------------------------------ */

const canvas = document.getElementById("universe");
const intro = document.getElementById("intro");
const startButton = document.getElementById("startButton");

const loader = document.getElementById("loader");
const loaderText = document.getElementById("loaderText");

const statusElement = document.getElementById("status");

const errorPanel = document.getElementById("errorPanel");
const errorMessage = document.getElementById("errorMessage");


/* ------------------------------
   Variables generales
------------------------------ */

let scene;
let camera;
let renderer;
let clock;

let mainStars;
let distantStars;
let coloredStars;

let animationFrameId = null;

let isUniverseReady = false;
let hasEntered = false;
let isPageVisible = true;

const pointer = {
    x: 0,
    y: 0
};

const smoothPointer = {
    x: 0,
    y: 0
};


/* ------------------------------
   Configuración de rendimiento
------------------------------ */

const isSmallScreen = window.matchMedia(
    "(max-width: 700px)"
).matches;

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

const STAR_CONFIG = {
    mainCount: isSmallScreen ? 1500 : 2800,
    distantCount: isSmallScreen ? 700 : 1400,
    coloredCount: isSmallScreen ? 180 : 320,

    mainSpread: 110,
    distantSpread: 160,
    coloredSpread: 95
};


/* ------------------------------
   Inicio
------------------------------ */

document.addEventListener("DOMContentLoaded", initializeUniverse);


/**
 * Inicializa toda la escena.
 */
async function initializeUniverse() {
    try {
        validateRequiredElements();

        updateStatus("Comprobando el navegador…");

        if (!supportsWebGL()) {
            throw new Error(
                "Este navegador no tiene WebGL disponible. " +
                "Prueba abrir la página con Chrome, Edge, Firefox o Safari actualizado."
            );
        }

        updateLoaderText("Preparando el espacio…");

        createScene();
        createCamera();
        createRenderer();

        updateLoaderText("Creando estrellas…");

        createStarFields();
        createEventListeners();

        handleResize();

        clock = new THREE.Clock();

        startAnimation();

        await wait(650);

        revealUniverse();

    } catch (error) {
        handleFatalError(error);
    }
}


/* ------------------------------
   Comprobaciones
------------------------------ */

/**
 * Comprueba que todos los elementos HTML necesarios existan.
 */
function validateRequiredElements() {
    const requiredElements = [
        canvas,
        intro,
        startButton,
        loader,
        loaderText,
        statusElement,
        errorPanel,
        errorMessage
    ];

    const hasMissingElement = requiredElements.some(
        (element) => !element
    );

    if (hasMissingElement) {
        throw new Error(
            "Falta uno o más elementos necesarios en index.html. " +
            "Asegúrate de haber reemplazado completamente el archivo."
        );
    }
}


/**
 * Comprueba la disponibilidad de WebGL.
 */
function supportsWebGL() {
    try {
        const testCanvas = document.createElement("canvas");

        const context =
            testCanvas.getContext("webgl2") ||
            testCanvas.getContext("webgl") ||
            testCanvas.getContext("experimental-webgl");

        return Boolean(context);

    } catch (error) {
        console.error("Error al comprobar WebGL:", error);
        return false;
    }
}


/* ------------------------------
   Escena y cámara
------------------------------ */

/**
 * Crea la escena principal.
 */
function createScene() {
    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x03030a);

    scene.fog = new THREE.FogExp2(
        0x03030a,
        0.009
    );
}


/**
 * Crea la cámara.
 */
function createCamera() {
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        500
    );

    camera.position.set(0, 0, 18);
}


/**
 * Crea el renderizador.
 */
function createRenderer() {
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isSmallScreen,
        alpha: false,
        powerPreference: "high-performance"
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight,
        false
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.setClearColor(
        0x03030a,
        1
    );
}


/* ------------------------------
   Campo de estrellas
------------------------------ */

/**
 * Crea todas las capas de estrellas.
 */
function createStarFields() {
    mainStars = createStars({
        count: STAR_CONFIG.mainCount,
        spread: STAR_CONFIG.mainSpread,
        size: isSmallScreen ? 0.08 : 0.065,
        opacity: 0.92,
        colorMode: "white"
    });

    distantStars = createStars({
        count: STAR_CONFIG.distantCount,
        spread: STAR_CONFIG.distantSpread,
        size: isSmallScreen ? 0.035 : 0.03,
        opacity: 0.5,
        colorMode: "soft"
    });

    coloredStars = createStars({
        count: STAR_CONFIG.coloredCount,
        spread: STAR_CONFIG.coloredSpread,
        size: isSmallScreen ? 0.11 : 0.09,
        opacity: 0.8,
        colorMode: "colored"
    });

    mainStars.rotation.x = 0.08;
    distantStars.rotation.x = -0.05;
    coloredStars.rotation.z = 0.03;

    scene.add(mainStars);
    scene.add(distantStars);
    scene.add(coloredStars);
}


/**
 * Genera una capa de estrellas.
 */
function createStars({
    count,
    spread,
    size,
    opacity,
    colorMode
}) {
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const color = new THREE.Color();

    for (let index = 0; index < count; index += 1) {
        const positionIndex = index * 3;

        const radius = randomBetween(
            spread * 0.22,
            spread
        );

        const theta = Math.random() * Math.PI * 2;

        const phi = Math.acos(
            randomBetween(-1, 1)
        );

        positions[positionIndex] =
            radius *
            Math.sin(phi) *
            Math.cos(theta);

        positions[positionIndex + 1] =
            radius *
            Math.sin(phi) *
            Math.sin(theta);

        positions[positionIndex + 2] =
            radius *
            Math.cos(phi);

        setStarColor(
            color,
            colorMode
        );

        colors[positionIndex] = color.r;
        colors[positionIndex + 1] = color.g;
        colors[positionIndex + 2] = color.b;
    }

    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );

    geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 3)
    );

    geometry.computeBoundingSphere();

    const material = new THREE.PointsMaterial({
        size,
        sizeAttenuation: true,
        transparent: true,
        opacity,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(
        geometry,
        material
    );

    points.userData.baseOpacity = opacity;

    return points;
}


/**
 * Asigna colores suaves a las estrellas.
 */
function setStarColor(color, mode) {
    if (mode === "colored") {
        const randomValue = Math.random();

        if (randomValue < 0.46) {
            color.setRGB(
                randomBetween(0.62, 0.8),
                randomBetween(0.72, 0.88),
                1
            );

            return;
        }

        if (randomValue < 0.8) {
            color.setRGB(
                1,
                randomBetween(0.62, 0.78),
                randomBetween(0.8, 0.94)
            );

            return;
        }

        color.setRGB(
            1,
            randomBetween(0.88, 0.98),
            randomBetween(0.72, 0.86)
        );

        return;
    }

    if (mode === "soft") {
        const brightness = randomBetween(
            0.48,
            0.78
        );

        color.setRGB(
            brightness * 0.88,
            brightness * 0.93,
            brightness
        );

        return;
    }

    const brightness = randomBetween(
        0.72,
        1
    );

    color.setRGB(
        brightness,
        brightness,
        randomBetween(brightness * 0.9, 1)
    );
}


/* ------------------------------
   Eventos
------------------------------ */

/**
 * Registra todos los eventos.
 */
function createEventListeners() {
    window.addEventListener(
        "resize",
        handleResize,
        { passive: true }
    );

    window.addEventListener(
        "orientationchange",
        handleOrientationChange,
        { passive: true }
    );

    window.addEventListener(
        "pointermove",
        handlePointerMove,
        { passive: true }
    );

    window.addEventListener(
        "touchmove",
        handleTouchMove,
        { passive: true }
    );

    startButton.addEventListener(
        "click",
        enterUniverse
    );

    document.addEventListener(
        "visibilitychange",
        handleVisibilityChange
    );

    window.addEventListener(
        "beforeunload",
        cleanUp
    );
}


/**
 * Guarda la posición del cursor.
 */
function handlePointerMove(event) {
    pointer.x =
        (event.clientX / window.innerWidth) * 2 - 1;

    pointer.y =
        -((event.clientY / window.innerHeight) * 2 - 1);
}


/**
 * Guarda la posición del dedo.
 */
function handleTouchMove(event) {
    const firstTouch = event.touches?.[0];

    if (!firstTouch) {
        return;
    }

    pointer.x =
        (firstTouch.clientX / window.innerWidth) * 2 - 1;

    pointer.y =
        -((firstTouch.clientY / window.innerHeight) * 2 - 1);
}


/**
 * Ajusta el universo al tamaño de pantalla.
 */
function handleResize() {
    if (!camera || !renderer) {
        return;
    }

    const width = Math.max(
        window.innerWidth,
        1
    );

    const height = Math.max(
        window.innerHeight,
        1
    );

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.setSize(
        width,
        height,
        false
    );
}


/**
 * Da tiempo al navegador para terminar el giro del teléfono.
 */
function handleOrientationChange() {
    window.setTimeout(
        handleResize,
        180
    );
}


/**
 * Reduce el trabajo cuando la página queda en segundo plano.
 */
function handleVisibilityChange() {
    isPageVisible = !document.hidden;

    if (isPageVisible && clock) {
        clock.getDelta();
    }
}


/* ------------------------------
   Entrada al universo
------------------------------ */

/**
 * Activa la transición después de presionar el botón.
 */
function enterUniverse() {
    if (!isUniverseReady || hasEntered) {
        return;
    }

    hasEntered = true;

    startButton.disabled = true;

    document.body.classList.add("has-entered");

    updateStatus(
        "Has entrado al universo."
    );

    window.setTimeout(() => {
        intro.setAttribute(
            "aria-hidden",
            "true"
        );
    }, 1300);
}


/* ------------------------------
   Animación
------------------------------ */

/**
 * Inicia el bucle de animación.
 */
function startAnimation() {
    if (animationFrameId !== null) {
        return;
    }

    animate();
}


/**
 * Renderiza cada fotograma.
 */
function animate() {
    animationFrameId = window.requestAnimationFrame(
        animate
    );

    if (!isPageVisible || !renderer || !scene || !camera) {
        return;
    }

    const elapsedTime = clock
        ? clock.getElapsedTime()
        : 0;

    updatePointerSmoothing();
    animateStars(elapsedTime);
    animateCamera(elapsedTime);

    renderer.render(
        scene,
        camera
    );
}


/**
 * Suaviza los movimientos del usuario.
 */
function updatePointerSmoothing() {
    const smoothing = prefersReducedMotion
        ? 0.02
        : 0.045;

    smoothPointer.x +=
        (pointer.x - smoothPointer.x) *
        smoothing;

    smoothPointer.y +=
        (pointer.y - smoothPointer.y) *
        smoothing;
}


/**
 * Mueve lentamente las capas de estrellas.
 */
function animateStars(elapsedTime) {
    if (!mainStars || !distantStars || !coloredStars) {
        return;
    }

    const motionMultiplier = prefersReducedMotion
        ? 0.18
        : 1;

    mainStars.rotation.y +=
        0.00022 *
        motionMultiplier;

    mainStars.rotation.x =
        0.08 +
        smoothPointer.y *
        0.018 *
        motionMultiplier;

    mainStars.rotation.y +=
        smoothPointer.x *
        0.00004 *
        motionMultiplier;

    distantStars.rotation.y -=
        0.00008 *
        motionMultiplier;

    distantStars.rotation.z =
        Math.sin(elapsedTime * 0.05) *
        0.018 *
        motionMultiplier;

    coloredStars.rotation.y +=
        0.00016 *
        motionMultiplier;

    coloredStars.rotation.z =
        0.03 +
        Math.cos(elapsedTime * 0.08) *
        0.012 *
        motionMultiplier;

    animateStarOpacity(
        elapsedTime,
        motionMultiplier
    );
}


/**
 * Crea un parpadeo muy suave.
 */
function animateStarOpacity(
    elapsedTime,
    motionMultiplier
) {
    if (
        !mainStars?.material ||
        !coloredStars?.material
    ) {
        return;
    }

    const mainBase =
        mainStars.userData.baseOpacity ?? 0.92;

    const coloredBase =
        coloredStars.userData.baseOpacity ?? 0.8;

    mainStars.material.opacity =
        mainBase +
        Math.sin(elapsedTime * 0.7) *
        0.035 *
        motionMultiplier;

    coloredStars.material.opacity =
        coloredBase +
        Math.sin(elapsedTime * 1.15) *
        0.08 *
        motionMultiplier;
}


/**
 * Da una sensación ligera de cámara flotante.
 */
function animateCamera(elapsedTime) {
    const motionMultiplier = prefersReducedMotion
        ? 0.15
        : 1;

    const targetX =
        smoothPointer.x *
        0.52 *
        motionMultiplier;

    const targetY =
        smoothPointer.y *
        0.3 *
        motionMultiplier;

    camera.position.x +=
        (targetX - camera.position.x) *
        0.022;

    camera.position.y +=
        (targetY - camera.position.y) *
        0.022;

    camera.position.z =
        18 +
        Math.sin(elapsedTime * 0.16) *
        0.28 *
        motionMultiplier;

    camera.lookAt(
        smoothPointer.x * 0.12,
        smoothPointer.y * 0.08,
        0
    );
}


/* ------------------------------
   Carga completada
------------------------------ */

/**
 * Muestra la escena cuando todo está listo.
 */
function revealUniverse() {
    isUniverseReady = true;

    document.body.classList.add("is-ready");

    startButton.disabled = false;

    updateLoaderText(
        "Universo listo"
    );

    updateStatus(
        "El universo está listo. Puedes entrar."
    );

    window.setTimeout(() => {
        loader.classList.add("is-hidden");
    }, 320);
}


/* ------------------------------
   Errores
------------------------------ */

/**
 * Muestra un error visible y también lo registra en consola.
 */
function handleFatalError(error) {
    console.error(
        "Error al iniciar el universo:",
        error
    );

    const message =
        error instanceof Error
            ? error.message
            : "Ocurrió un error desconocido.";

    errorMessage.textContent = message;
    errorPanel.hidden = false;

    updateLoaderText(
        "No se pudo completar la carga"
    );

    updateStatus(
        `Error: ${message}`
    );

    startButton.disabled = true;
}


/* ------------------------------
   Utilidades
------------------------------ */

/**
 * Cambia el texto del cargador.
 */
function updateLoaderText(message) {
    if (loaderText) {
        loaderText.textContent = message;
    }
}


/**
 * Actualiza el estado accesible.
 */
function updateStatus(message) {
    if (statusElement) {
        statusElement.textContent = message;
    }
}


/**
 * Devuelve un número aleatorio entre dos valores.
 */
function randomBetween(minimum, maximum) {
    return (
        minimum +
        Math.random() *
        (maximum - minimum)
    );
}


/**
 * Pausa sencilla utilizando una promesa.
 */
function wait(milliseconds) {
    return new Promise((resolve) => {
        window.setTimeout(
            resolve,
            milliseconds
        );
    });
}


/**
 * Libera recursos al cerrar la página.
 */
function cleanUp() {
    if (animationFrameId !== null) {
        window.cancelAnimationFrame(
            animationFrameId
        );

        animationFrameId = null;
    }

    disposePoints(mainStars);
    disposePoints(distantStars);
    disposePoints(coloredStars);

    if (renderer) {
        renderer.dispose();
    }
}


/**
 * Libera una capa de partículas.
 */
function disposePoints(points) {
    if (!points) {
        return;
    }

    points.geometry?.dispose();
    points.material?.dispose();
}