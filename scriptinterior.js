import * as THREE from 'https://esm.sh/three@0.161.0';
import { GLTFLoader } from 'https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'https://esm.sh/three@0.161.0/examples/jsm/controls/PointerLockControls.js';

let camera, scene, renderer, controls;
let clock;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let finalPosition = new THREE.Vector3();
let targetPosition = null;
let targetRotation = null;
let ambientLight;
let spotLight;
let pointLight;
let currentModal = null;
const overlay = document.getElementById('overlay');

const CAMERA_MODAL_VIEW_OFFSET = new THREE.Vector3(50, 0, 30);
const CAMERA_SPEED = 0.05; 
const CAMERA_VIEWS = {
  'modal-contacto': new THREE.Vector3(60, -10, -30),
  'modal-galeria': new THREE.Vector3(-70, -10, 30),
  'modal-informacion': new THREE.Vector3(-70, -10, -50),
  'modal-modelo3d': new THREE.Vector3(-100, 30, 0),
  'modal-convocatoria': new THREE.Vector3(-200, -10, 30),
};

const CAMERA_ROTATIONS = {
  'modal-galeria': { y: -Math.PI },     
  'modal-informacion': { y: -Math.PI*2},
  'modal-modelo3d': { y: Math.PI / 2 },               
  'modal-contacto': { y: Math.PI*1.2 },
    'modal-convocatoria': { y: -Math.PI / 4 },
};

function showModalMessage(message) {
    const modal = document.createElement('div');
    modal.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-2xl z-50 max-w-sm text-center border-4 border-blue-500';
    modal.innerHTML = `
        <p class="text-gray-800 text-lg mb-4">${message}</p>
        <button onclick="this.parentNode.remove()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200 shadow-md">
            Cerrar
        </button>
    `;
    document.body.appendChild(modal);
}
window.alert = showModalMessage;

function esMovil() {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);
}

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    controls = new PointerLockControls(camera, document.body);

    const isMobile = esMovil();

    if (isMobile) {
        overlay.innerHTML = "<p class='text-xl'>Gira la pantalla para interactuar. Usa los botones para moverte.</p>";
        overlay.style.display = "flex";
        crearControlesMoviles();
    } else {
        overlay.innerHTML = "<p class='text-xl'>Haz clic para mover la cámara (W, A, S, D).</p>";
        overlay.addEventListener("click", () => {
            controls.lock();
        });
    }

    controls.addEventListener("lock", () => {
        overlay.style.display = "none";
        ocultarObjetos();
    });
    controls.addEventListener("unlock", () => {
        overlay.style.display = "flex";
        restaurarTitulos();
    });

    ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(310, 0, 0);
    scene.add(dirLight);

    loadMainScene();

    if (!isMobile) {
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("keyup", onKeyUp);
    }

    clock = new THREE.Clock();
    window.addEventListener("resize", onWindowResize, false);
    // 💡 Luz puntual (PointLight)
    luz2(150,120,-120);
    luz2(40,120,-120);
    luz2(-94,120,-120);
    luz2(150,120,0);
    luz2(40,120,0);
    luz2(-94,120,0);
    luz2(150,120,120);
    luz2(40,120,120);
    luz2(-94,120,120);

    luz(150,125,-120);
    luz(40,150,-120);
    luz(-94,140,-120);
    luz(150,125,0);
    luz(40,150,0);
    luz(-94,140,0);
    luz(150,125,120);
    luz(40,150,120);
    luz(-94,140,120);
    // Añadir un ayudante para visualizar la luz puntual

    renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}
function luz(x,y,z){
    pointLight = new THREE.PointLight(0xffffff, 100, 150);
    pointLight.position.set(x,y,z);
    scene.add(pointLight);
}
function luz2(x,y,z){
spotLight = new THREE.SpotLight(0xffffff, 400);
spotLight.position.set(x,y,z);

spotLight.castShadow = true;
// Aumentar resolución del mapa de sombras (más detalle)
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
// Ajustar la cámara de sombra
spotLight.shadow.camera.near = 10;
spotLight.shadow.camera.far = 300;
spotLight.shadow.focus = 1; // mejora precisión de enfoque
// Reducir el "acné" o parches
spotLight.shadow.bias = -0.001;
// Opcional: sombras más suaves
renderer.shadowMap.type = THREE.PCFSoftShadowMap;


spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.5;
spotLight.decay = 1;
spotLight.distance = 150;
spotLight.castShadow = true;

// Configurar destino (hacia dónde apunta)
const targetObject = new THREE.Object3D();
targetObject.position.set(x,y-100,z); // centro de la escena
scene.add(targetObject);
spotLight.target = targetObject;        // genera sombras
    scene.add(spotLight);
    /*const spotLightHelper = new THREE.SpotLightHelper(spotLight, 0xFFFF00); // Color amarillo para el borde
            scene.add(spotLightHelper);*/
}
function loadMainScene() {
    const loader = new GLTFLoader();
    loader.load('https://fr3d5.github.io/auditorio/public/auditorio.glb', function (gltf) {
        const model = gltf.scene;
        model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;    // proyecta sombra
      child.receiveShadow = true; // recibe sombra
    }
  });
        scene.add(model);
        
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        
        finalPosition.set(center.x + 130, center.y-30, center.z);
        
        camera.position.copy(finalPosition);
        camera.rotation.y = 1.6;
        controls.getObject().position.copy(camera.position);

        loadFlowers(finalPosition.clone().add(new THREE.Vector3(-280, -5, 110)));
        loadFlowers2(finalPosition.clone().add(new THREE.Vector3(-315, -19, 183)));
        loadFlowers3(finalPosition.clone().add(new THREE.Vector3(-315,-19,-183)));
        loadFlowers4(finalPosition.clone().add(new THREE.Vector3(-315,15,183)));
        loadFlowers5(finalPosition.clone().add(new THREE.Vector3(-315,-43,-183)));
        loadFlowers6(finalPosition.clone().add(new THREE.Vector3(-315,-43,183)));
        loadFlowers7(finalPosition.clone().add(new THREE.Vector3(-315,15,-183)));
        loadFlowers6(finalPosition.clone().add(new THREE.Vector3(-300,-43,150)));
        loadFlowers6(finalPosition.clone().add(new THREE.Vector3(-300,-43,-150)));
        loadFlowers8(finalPosition.clone().add(new THREE.Vector3(-313,-19,78)));
        loadFlowers8(finalPosition.clone().add(new THREE.Vector3(-313,-19,65)));
        loadFlowers8(finalPosition.clone().add(new THREE.Vector3(-313,-19,52)));
        loadFlowers8(finalPosition.clone().add(new THREE.Vector3(-313,-19,39)));
        loadFlowers8(finalPosition.clone().add(new THREE.Vector3(-313,-19,27)));
        loadFlowers8(finalPosition.clone().add(new THREE.Vector3(-313,-19,15)));
        loadFlowers8(finalPosition.clone().add(new THREE.Vector3(-313,-19,3)));
        loadFlowers8(finalPosition.clone().add(new THREE.Vector3(-313,-19,-9)));
        loadFlowers8(finalPosition.clone().add(new THREE.Vector3(-313,-19,-21)));
        loadFlowers8(finalPosition.clone().add(new THREE.Vector3(-313,-19,-33)));
        loadFlowers8(finalPosition.clone().add(new THREE.Vector3(-313,-19,-45)));
        loadFlowers8(finalPosition.clone().add(new THREE.Vector3(-313,-19,-57)));
        loadFlowers8(finalPosition.clone().add(new THREE.Vector3(-313,-19,-69)));
        loadFlowers9(finalPosition.clone().add(new THREE.Vector3(-300,19,-105)));
        loadFlowers9(finalPosition.clone().add(new THREE.Vector3(-300,19,105)));
        loadFlowers10(finalPosition.clone().add(new THREE.Vector3(-285,-19,-90)));

    }, undefined, function (error) {
        showModalMessage('Error al cargar scenesinflores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar scenesinflores.glb:', error);
    });
}

function loadFlowers(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/bandera/public/banderas.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(30,50,30);
        model2.rotation.y = Math.PI / 2;
        model2.position.copy(position);
        scene.add(model2);
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
    });
}

function loadFlowers2(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/parlante/public/parlante.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(30,30,30);
        model2.rotation.y = Math.PI;
        model2.position.copy(position);
        scene.add(model2);
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
    });
}

function loadFlowers3(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/parlante/public/parlante.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(30,30,30);
        model2.rotation.y = -Math.PI/12;
        model2.position.copy(position);
        scene.add(model2);
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
    });
}

function loadFlowers4(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/parlante/public/parlante.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(20,40,20);
        model2.rotation.y = Math.PI
        model2.position.copy(position);
        scene.add(model2);
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
    });
}

function loadFlowers5(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/parlan/public/mesa.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(20,20,20);
        model2.position.copy(position);
        scene.add(model2);
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
    });
}

function loadFlowers6(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/parlan/public/mesa.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(20,20,20);
        model2.position.copy(position);
        scene.add(model2);
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
    });
}

function loadFlowers7(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/parlante/public/parlante.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(20,40,20);
        model2.rotation.y = Math.PI
        model2.position.copy(position);
        scene.add(model2);
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
    });
}
function loadFlowers8(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/silla/public/sillaMesa.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(25,25,25);
        model2.position.copy(position);
        scene.add(model2);
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
    });
}
function loadFlowers9(position) {
    // Crear elemento de video oculto
    const video = document.createElement('video');
    video.id = 'videoElement_' + Math.random();
    video.style.display = 'none';
    video.autoplay = true;
    video.loop = true;
    video.muted = false;
    video.crossOrigin = 'anonymous';
    video.preload = 'auto';
    video.playsinline = true; // Para que funcione en móviles
    video.volume = 0.05; // Ajustar volumen según sea necesario
    
    const source = document.createElement('source');
    source.src = './public/img/comiendo.mp4';
    source.type = 'video/mp4';
    video.appendChild(source);
    
    document.body.appendChild(video);
    
    // Esperar a que el video esté listo
    video.addEventListener('loadedmetadata', () => {
        console.log('Video metadata cargado, iniciando reproducción');
        
        // Crear textura de video
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        
        // Crear geometría y material
        const geometry = new THREE.PlaneGeometry(16, 9);
        const material = new THREE.MeshBasicMaterial({ 
            map: videoTexture,
            side: THREE.DoubleSide,
            toneMapped: false
        });
        
        // Crear mesh
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.y = Math.PI / 2;
        plane.scale.set(5, 5, 5);
        plane.position.copy(position);
        plane.castShadow = true;
        plane.receiveShadow = true;
        
        scene.add(plane);                                     //  video desactivado temporalmente
        
        // Agregar a un array para actualizar en cada frame
        if (!window.videoPlanes) {
            window.videoPlanes = [];
        }
        window.videoPlanes.push({ 
            video, 
            texture: videoTexture,
            material: material 
        });
        
        // Intentar reproducir
        video.play().then(() => {
            console.log('Video reproduciendo');
        }).catch(err => {
            console.error('Error al reproducir video:', err);
            showModalMessage('Error al reproducir video. El navegador requiere interacción del usuario.');
        });
    });
    
    video.addEventListener('error', (e) => {
        console.error('Error al cargar el video:', e);
        showModalMessage('Error al cargar el video. Verifica la ruta: ./public/img/video1.mp4');
    });
}
function loadFlowers10(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/atril/public/atrilVidrio.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(6,6,6);
        model2.position.copy(position);
        scene.add(model2);
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
    });
}
function onKeyDown(event) {
    switch (event.code) {
        case "KeyW": moveForward = true; break;
        case "KeyA": moveLeft = true; break;
        case "KeyS": moveBackward = true; break;
        case "KeyD": moveRight = true; break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case "KeyW": moveForward = false; break;
        case "KeyA": moveLeft = false; break;
        case "KeyS": moveBackward = false; break;
        case "KeyD": moveRight = false; break;
    }
}

function lerpAngle(start, end, t) {
    let diff = end - start;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return start + diff * t;
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const speed = 15;

    if (controls.isLocked) {
        if (moveForward) controls.moveForward(speed * delta);
        if (moveBackward) controls.moveForward(-speed * delta);
        if (moveLeft) controls.moveRight(-speed * delta);
        if (moveRight) controls.moveRight(speed * delta);
    }

    if (targetPosition) {
        controls.getObject().position.lerp(targetPosition, CAMERA_SPEED);
        if (controls.getObject().position.distanceTo(targetPosition) < 0.1) {
            targetPosition = null;
        }
    }
    
    if (targetRotation && camera) {
        camera.rotation.y = lerpAngle(camera.rotation.y, targetRotation.y, CAMERA_SPEED);
        
        if (Math.abs(camera.rotation.y - targetRotation.y) < 0.01) {
            camera.rotation.y = targetRotation.y;
            targetRotation = null;
        }
    }
if (window.videoPlanes && window.videoPlanes.length > 0) {
    window.videoPlanes.forEach(item => {
        // Siempre actualizar la textura en cada frame
        if (item.video && item.texture) {
            // Forzar actualización
            item.texture.needsUpdate = true;
            
            // Debug: mostrar estado del video
            if (item.video.paused) {
                console.warn('Video pausado, intentando reproducir');
                item.video.play().catch(e => console.error('Error:', e));
            }
        }
    });
}
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function crearControlesMoviles() {
    const pad = document.createElement("div");
    pad.className = "controles-moviles";
    pad.innerHTML = `
    <div class="botones">
        <button id="btn-up">▲</button>
        <div>
            <button id="btn-left">◀</button>
            <button id="btn-right">▶</button>
        </div>
        <button id="btn-down">▼</button>
    </div>
    `;
    document.body.appendChild(pad);

    document.getElementById("btn-up").addEventListener("touchstart", () => moveForward = true);
    document.getElementById("btn-up").addEventListener("touchend", () => moveForward = false);
    document.getElementById("btn-down").addEventListener("touchstart", () => moveBackward = true);
    document.getElementById("btn-down").addEventListener("touchend", () => moveBackward = false);
    document.getElementById("btn-left").addEventListener("touchstart", () => moveLeft = true);
    document.getElementById("btn-left").addEventListener("touchend", () => moveLeft = false);
    document.getElementById("btn-right").addEventListener("touchstart", () => moveRight = true);
    document.getElementById("btn-right").addEventListener("touchend", () => moveRight = false);
}
var abrirBotones = document.querySelectorAll('a[id^="abrir-modal-"]');
var cerrarBotones = document.querySelectorAll('.cerrar-modal');
var modales = document.querySelectorAll('.modal');

function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (controls && controls.isLocked) controls.unlock();

    if (finalPosition) {
        const offset = CAMERA_VIEWS[modalId] || CAMERA_MODAL_VIEW_OFFSET;
        targetPosition = finalPosition.clone().add(offset);
    } else {
        targetPosition = controls.getObject().position.clone().add(new THREE.Vector3(0, 1, 0));
    }

    targetRotation = CAMERA_ROTATIONS[modalId] || { y: camera.rotation.y };

    modal.style.display = 'block';
}

function cerrarModalConRotacion() {
    restaurarTitulos();
    
    setTimeout(() => {
        iframeModal.style.display = 'none';
        iframeVentana.src = '';
        currentModalId = null; // ✅ Limpiar modal actual
    }, 300);
    
    if (finalPosition) {
        targetPosition = finalPosition.clone();
        targetRotation = { y: 1.6 }; // Rotación inicial correcta
    }
}

abrirBotones.forEach(btn => {
    btn.addEventListener('click', (event) => {
        event.preventDefault();
        const modalId = btn.id.replace('abrir-', '');
        abrirModal(modalId);
    });
});

cerrarBotones.forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        if (modal) cerrarModal(modal);
    });
});

window.addEventListener('click', (event) => {
    modales.forEach(modal => {
        if (event.target === modal) cerrarModal(modal);
    });
});

const iframeModal = document.getElementById('modal-paginas');
const iframeVentana = document.getElementById('iframeVentana');

const btnInicio = document.getElementById('abrir-inicio');
const btnGaleria = document.getElementById('abrir-galeria');
const btnInformacion = document.getElementById('abrir-informacion');
const btnModelo3D = document.getElementById('abrir-modelo3d');
const btnConvocatoria = document.getElementById('abrir-convocatoria');
    

function abrirIframe(url, modalId) {
    if (controls && controls.isLocked) controls.unlock();
    currentModal = modalId;
    if (finalPosition) {
        const offset = CAMERA_VIEWS[modalId] || CAMERA_MODAL_VIEW_OFFSET;
        targetPosition = finalPosition.clone().add(offset);
    } else {
        targetPosition = controls.getObject().position.clone().add(new THREE.Vector3(0, 1, 0));
    }

    targetRotation = CAMERA_ROTATIONS[modalId] || { y: camera.rotation.y };

    iframeVentana.src = url;
    iframeModal.style.display = 'flex';
    ocultarObjetos();
    
    configurarScrollIframe();
}
function ocultarObjetos(){
if (overlay) overlay.style.display = 'none';
    setTimeout(() => {
        const h1 = document.querySelector('.contenidoinfo');
        const h2 = document.querySelector('.posicion1');
        if (h1) h1.classList.add('posicion-final-h1');
        if (h2) h2.classList.add('posicion-final-h2');
    }, 100);
}

function restaurarTitulos() {
    const h1 = document.querySelector('.contenidoinfo');
    const h2 = document.querySelector('.posicion1');
    if (h1) h1.classList.remove('posicion-final-h1');
    if (h2) h2.classList.remove('posicion-final-h2');
    if (overlay) overlay.style.display = 'flex';
}

if (btnInicio) {
    btnInicio.addEventListener('click', (e) => {
        e.preventDefault();
        if (controls && controls.isLocked) controls.unlock();
        
        restaurarTitulos();
        
        if (finalPosition) {
            targetPosition = finalPosition.clone();
            targetRotation = { y: -1.6 };
        }
    });
}

if (btnGaleria) {
    btnGaleria.addEventListener('click', (e) => {
        e.preventDefault();
        abrirIframe('inscripciones.html', 'modal-galeria');
    });
}

if (btnInformacion) {
    btnInformacion.addEventListener('click', (e) => {
        e.preventDefault();
        abrirIframe('informacion.html', 'modal-informacion');
    });
}

if (btnModelo3D) {
    btnModelo3D.addEventListener('click', (e) => {
        e.preventDefault();
        abrirIframe('interior.html', 'modal-modelo3d');
    });
}
if (btnConvocatoria) {
    btnConvocatoria.addEventListener('click', (e) => {
        e.preventDefault();
        abrirIframe('convocatoria.html', 'modal-convocatoria');
    });
}

function configurarScrollIframe() {
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'iframe-scroll') {
            const scrollDelta = event.data.deltaY;
            const moveSpeed = 0.5;
            
            if (scrollDelta < 0) {
                controls.getObject().position.x += moveSpeed;
            } else {
                controls.getObject().position.x -= moveSpeed;
            }
        }
    });
}

// Cierre del modal iframe + volver cámara
iframeModal.querySelector('.cerrar-modal').addEventListener('click', cerrarModalConRotacion);

window.addEventListener('click', (e) => {
    if (e.target === iframeModal) {
        cerrarModalConRotacion();
    }
});

// 7. BOTÓN CONVOCATORIA - Asegurar que existe y funciona
if (btnConvocatoria) {
    btnConvocatoria.addEventListener('click', (e) => {
        e.preventDefault();
        abrirIframe('convocatoria.html', 'modal-convocatoria');
    });
}

// =======================
// 🔹 MENÚ DESPLEGABLE
// =======================
const menu = document.querySelector('#workarea');
const toggle = document.querySelector('.menu-toggle');

toggle.addEventListener('click', () => {
    menu.classList.toggle('workarea-open');
});
let modoLuz = 0;
    const botonLuz = document.querySelector('.boton-luz');

    if (botonLuz) {
        botonLuz.addEventListener('click', () => {
            modoLuz = (modoLuz + 1) % 2; // Cicla entre 0, 1, 2

            switch (modoLuz) {
                case 0:
                    ambientLight.intensity = 0.1;
                    showModalMessage('🌙 Modo oscuro activado');
                    break;
                case 1:
                    ambientLight.intensity = 2;
                    showModalMessage('💡 Modo normal activado');
                    break;
                
            }
        });
    }
const btnMas = document.getElementById('abrir-modal-contacto');
        const menuDesplegable = document.getElementById('menuDesplegable');
        const modalContacto = document.getElementById('modal-contacto');

        const btnOpcion1 = document.getElementById('btnOpcion1');
        const btnOpcion2 = document.getElementById('btnOpcion2');
        const submenu1 = document.getElementById('submenu1');
        const submenu2 = document.getElementById('submenu2');
        const chevron1 = document.getElementById('chevron1');
        const chevron2 = document.getElementById('chevron2');

        // Alternar menu desplegable
        btnMas.addEventListener('click', function(e) {
            e.stopPropagation();
            menuDesplegable.classList.toggle('active');
            submenu1.classList.remove('active');
            submenu2.classList.remove('active');
            chevron1.classList.remove('active');
            chevron2.classList.remove('active');
        });

        // Opcion 1
        btnOpcion1.addEventListener('click', function(e) {
            e.stopPropagation();
            submenu1.classList.toggle('active');
            chevron1.classList.toggle('active');
            submenu2.classList.remove('active');
            chevron2.classList.remove('active');
        });

        // Opcion 2
        btnOpcion2.addEventListener('click', function(e) {
            e.stopPropagation();
            submenu2.classList.toggle('active');
            chevron2.classList.toggle('active');
            submenu1.classList.remove('active');
            chevron1.classList.remove('active');
        });

        // Cerrar menu al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.menu-principal')) {
                menuDesplegable.classList.remove('active');
                submenu1.classList.remove('active');
                submenu2.classList.remove('active');
                chevron1.classList.remove('active');
                chevron2.classList.remove('active');
            }
        });

        // Cerrar menu al hacer clic en un enlace
        document.querySelectorAll('.submenu a').forEach(link => {
            link.addEventListener('click', function() {
                menuDesplegable.classList.remove('active');
                submenu1.classList.remove('active');
                submenu2.classList.remove('active');
                chevron1.classList.remove('active');
                chevron2.classList.remove('active');
            });
        });

        // Modal
function cerrarModal(modal) {     
    if (modal) {         
        modal.style.display = 'none';     
    } 
}

// Modal - Solución 4: Reemplaza la línea problemática
const cerrarModalBtn = document.querySelector('.cerrar-modal');
if (cerrarModalBtn && modalContacto) {
    cerrarModalBtn.addEventListener('click', function() {
        modalContacto.classList.remove('active');
    });
}

window.addEventListener('click', function(e) {
    if (e.target === modalContacto) {
        modalContacto.classList.remove('active');
    }
});
// ====================================
// 🎬 SISTEMA DE CONTROLES DE VIDEO
// ====================================

let videoControlsVisible = false;
let currentVideoPlaying = null;

// Crear interfaz de controles de video
function crearControlesVideo() {
    const controles = document.createElement('div');
    controles.id = 'video-controls-container';
    controles.className = 'video-controls-hidden';
    controles.innerHTML = `
        <div class="video-controls-panel">
            <div class="video-info">
                <span id="video-tiempo">0:00</span>
                <span class="video-duracion"> / <span id="video-duracion-total">0:00</span></span>
            </div>
            
            <div class="video-barra-progreso">
                <div id="video-progress-bar" class="progress-bar">
                    <div id="video-progress-fill" class="progress-fill"></div>
                </div>
            </div>
            
            <div class="video-botones">
                <button id="btn-play-pause" class="btn-video" title="Play/Pause (Espacio)">
                    ▶️
                </button>
                <button id="btn-stop" class="btn-video" title="Detener">
                    ⏹️
                </button>
                <button id="btn-retroceso" class="btn-video" title="Retroceso 5s (←)">
                    ⏪
                </button>
                <button id="btn-avance" class="btn-video" title="Avance 5s (→)">
                    ⏩
                </button>
                
                <div class="separador-controles"></div>
                
                <button id="btn-volumen" class="btn-video" title="Silenciar/Activar">
                    🔊
                </button>
                <input id="slider-volumen" type="range" min="0" max="100" value="5" 
                       class="slider-volumen" title="Volumen (+ y -)">
                
                <div class="separador-controles"></div>
                
                <button id="btn-pantalla-completa" class="btn-video" title="Pantalla Completa (F)">
                    ⛶
                </button>
                <button id="btn-cerrar-controles" class="btn-video" title="Cerrar (ESC)">
                    ✕
                </button>
            </div>
            
            <div class="video-velocidad">
                <label for="select-velocidad">Velocidad:</label>
                <select id="select-velocidad" class="select-velocidad">
                    <option value="0.5">0.5x</option>
                    <option value="1" selected>1x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                </select>
            </div>
        </div>
    `;
    
    document.body.appendChild(controles);
    inicializarControlesVideo();
}

function inicializarControlesVideo() {
    const btnPlayPause = document.getElementById('btn-play-pause');
    const btnStop = document.getElementById('btn-stop');
    const btnRetroceso = document.getElementById('btn-retroceso');
    const btnAvance = document.getElementById('btn-avance');
    const btnVolumen = document.getElementById('btn-volumen');
    const sliderVolumen = document.getElementById('slider-volumen');
    const btnPantallaCompleta = document.getElementById('btn-pantalla-completa');
    const btnCerrarControles = document.getElementById('btn-cerrar-controles');
    const selectVelocidad = document.getElementById('select-velocidad');
    const progressBar = document.getElementById('video-progress-bar');

    // Play/Pause
    btnPlayPause.addEventListener('click', () => {
        if (window.videoPlanes && window.videoPlanes.length > 0) {
            const video = window.videoPlanes[0].video;
            if (video.paused) {
                video.play();
                btnPlayPause.textContent = '⏸️';
            } else {
                video.pause();
                btnPlayPause.textContent = '▶️';
            }
        }
    });

    // Stop
    btnStop.addEventListener('click', () => {
        if (window.videoPlanes && window.videoPlanes.length > 0) {
            const video = window.videoPlanes[0].video;
            video.pause();
            video.currentTime = 0;
            btnPlayPause.textContent = '▶️';
            actualizarBarraProgreso();
        }
    });

    // Retroceso 5s
    btnRetroceso.addEventListener('click', () => {
        if (window.videoPlanes && window.videoPlanes.length > 0) {
            const video = window.videoPlanes[0].video;
            video.currentTime = Math.max(0, video.currentTime - 5);
        }
    });

    // Avance 5s
    btnAvance.addEventListener('click', () => {
        if (window.videoPlanes && window.videoPlanes.length > 0) {
            const video = window.videoPlanes[0].video;
            video.currentTime = Math.min(video.duration, video.currentTime + 5);
        }
    });

    // Volumen
    btnVolumen.addEventListener('click', () => {
        if (window.videoPlanes && window.videoPlanes.length > 0) {
            const video = window.videoPlanes[0].video;
            if (video.volume > 0) {
                video.volume = 0;
                btnVolumen.textContent = '🔇';
                sliderVolumen.value = 0;
            } else {
                video.volume = sliderVolumen.value / 100;
                btnVolumen.textContent = '🔊';
            }
        }
    });

    // Slider de volumen
    sliderVolumen.addEventListener('input', (e) => {
        if (window.videoPlanes && window.videoPlanes.length > 0) {
            const video = window.videoPlanes[0].video;
            video.volume = e.target.value / 100;
            
            if (video.volume === 0) {
                btnVolumen.textContent = '🔇';
            } else if (video.volume < 0.5) {
                btnVolumen.textContent = '🔉';
            } else {
                btnVolumen.textContent = '🔊';
            }
        }
    });

    // Pantalla completa
    btnPantallaCompleta.addEventListener('click', () => {
        if (window.videoPlanes && window.videoPlanes.length > 0) {
            const video = window.videoPlanes[0].video;
            if (video.requestFullscreen) {
                video.requestFullscreen().catch(err => console.error('Error:', err));
            }
        }
    });

    // Cerrar controles
    btnCerrarControles.addEventListener('click', () => {
        ocultarControlesVideo();
    });

    // Velocidad de reproducción
    selectVelocidad.addEventListener('change', (e) => {
        if (window.videoPlanes && window.videoPlanes.length > 0) {
            const video = window.videoPlanes[0].video;
            video.playbackRate = parseFloat(e.target.value);
        }
    });

    // Barra de progreso - click para buscar
    progressBar.addEventListener('click', (e) => {
        if (window.videoPlanes && window.videoPlanes.length > 0) {
            const video = window.videoPlanes[0].video;
            const rect = progressBar.getBoundingClientRect();
            const porcentaje = (e.clientX - rect.left) / rect.width;
            video.currentTime = porcentaje * video.duration;
        }
    });

    // Actualizar barra de progreso continuamente
    if (window.videoPlanes && window.videoPlanes.length > 0) {
        const video = window.videoPlanes[0].video;
        video.addEventListener('timeupdate', actualizarBarraProgreso);
        video.addEventListener('loadedmetadata', () => {
            document.getElementById('video-duracion-total').textContent = formatearTiempo(video.duration);
        });
    }
}

function actualizarBarraProgreso() {
    if (window.videoPlanes && window.videoPlanes.length > 0) {
        const video = window.videoPlanes[0].video;
        const progressFill = document.getElementById('video-progress-fill');
        const tiempoActual = document.getElementById('video-tiempo');
        
        if (video.duration) {
            const porcentaje = (video.currentTime / video.duration) * 100;
            progressFill.style.width = porcentaje + '%';
            tiempoActual.textContent = formatearTiempo(video.currentTime);
        }
    }
}

function formatearTiempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segs = Math.floor(segundos % 60);
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
}

function mostrarControlesVideo() {
    const container = document.getElementById('video-controls-container');
    if (container) {
        container.classList.remove('video-controls-hidden');
        container.classList.add('video-controls-visible');
        videoControlsVisible = true;
    }
}

function ocultarControlesVideo() {
    const container = document.getElementById('video-controls-container');
    if (container) {
        container.classList.remove('video-controls-visible');
        container.classList.add('video-controls-hidden');
        videoControlsVisible = false;
    }
}

// ====================================
// 🎹 ATAJOS DE TECLADO
// ====================================

document.addEventListener('keydown', (e) => {
    if (!window.videoPlanes || window.videoPlanes.length === 0) return;
    
    const video = window.videoPlanes[0].video;
    const btnPlayPause = document.getElementById('btn-play-pause');
    
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            if (video.paused) {
                video.play();
                btnPlayPause.textContent = '⏸️';
            } else {
                video.pause();
                btnPlayPause.textContent = '▶️';
            }
            mostrarControlesVideo();
            break;
            
        case 'ArrowRight':
            e.preventDefault();
            video.currentTime = Math.min(video.duration, video.currentTime + 5);
            mostrarControlesVideo();
            break;
            
        case 'ArrowLeft':
            e.preventDefault();
            video.currentTime = Math.max(0, video.currentTime - 5);
            mostrarControlesVideo();
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            video.volume = Math.min(1, video.volume + 0.1);
            document.getElementById('slider-volumen').value = video.volume * 100;
            mostrarControlesVideo();
            break;
            
        case 'ArrowDown':
            e.preventDefault();
            video.volume = Math.max(0, video.volume - 0.1);
            document.getElementById('slider-volumen').value = video.volume * 100;
            mostrarControlesVideo();
            break;
            
        case 'KeyF':
            e.preventDefault();
            document.getElementById('btn-pantalla-completa').click();
            break;
            
        case 'Escape':
            e.preventDefault();
            ocultarControlesVideo();
            break;
            
        case 'KeyM':
            e.preventDefault();
            document.getElementById('btn-volumen').click();
            mostrarControlesVideo();
            break;
    }
});

// Ocultar controles después de 3 segundos de inactividad
let timeoutControles;
document.addEventListener('mousemove', () => {
    if (videoControlsVisible) {
        clearTimeout(timeoutControles);
        timeoutControles = setTimeout(() => {
            ocultarControlesVideo();
        }, 3000);
    }
});

// Inicializar controles cuando carga la página
window.addEventListener('load', () => {
    crearControlesVideo();
});