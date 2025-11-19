import * as THREE from 'https://esm.sh/three@0.161.0';
import { FBXLoader } from 'https://esm.sh/three@0.161.0/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'https://esm.sh/three@0.161.0/examples/jsm/controls/OrbitControls.js';

let camera, scene, renderer, controls;
let mixer, model;
let pointLight;
const clock = new THREE.Clock();
const mouse = new THREE.Vector2();
const lightTarget = new THREE.Vector3();
let time = 0;

init();
animate();

function init() {
    // 🎬 Escena
    scene = new THREE.Scene();
    // 💡 Luces
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 5);
    scene.add(ambientLight);

    pointLight = new THREE.PointLight(0xffaa33, 3, 50);
    scene.add(pointLight);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);

    // 🕹️ Controles de órbita
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth*0.4, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;


    // 🎧 Eventos
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    lightTarget.set(mouse.x * 10, mouse.y * 5, 5);
}
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    time += delta;

    if (mixer) mixer.update(delta);
    //if (model) model.rotation.y += 0.005;

    pointLight.position.lerp(lightTarget, 0.05);
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/* 🧭 CÓDIGO DE MODALES Y MENÚ (sin cambios, pero limpio) */
const abrirBotones = document.querySelectorAll('a[id^="abrir-modal-"]');
const cerrarBotones = document.querySelectorAll('.cerrar-modal');
const modales = document.querySelectorAll('.modal');

abrirBotones.forEach(btn => {
    btn.addEventListener('click', event => {
        event.preventDefault();
        const modalId = btn.id.replace('abrir-', '');
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'block';
    });
});

cerrarBotones.forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        if (modal) modal.style.display = 'none';
    });
});

window.addEventListener('click', event => {
    modales.forEach(modal => {
        if (event.target === modal) modal.style.display = 'none';
    });
});

const menu = document.querySelector('#workarea');
const toggle = document.querySelector('.menu-toggle');
if (menu && toggle) {
    toggle.addEventListener('click', () => {
        menu.classList.toggle('workarea-open');
    });
}