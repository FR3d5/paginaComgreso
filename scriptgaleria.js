import * as THREE from 'https://esm.sh/three@0.161.0';
import { GLTFLoader } from 'https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://esm.sh/three@0.161.0/examples/jsm/controls/OrbitControls.js';

let camera, scene, renderer, controls;
let mixer,model;
let time = 0;
const clock = new THREE.Clock();

init();
animate();

function init() {
    scene = new THREE.Scene();

    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(0, 20, 10);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth*0.7, window.innerHeight);
    if(window.innerWidth < 676){
        renderer.setSize(window.innerWidth, window.innerHeight*0.6);
    }
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight,0.1,2000);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;

   /* const loader = new GLTFLoader();
    loader.load('./public/modelos/padresito.glb', function (gltf) {
        model = gltf.scene;
        scene.add(model);

        if (gltf.animations && gltf.animations.length) {
            mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
        }

        model.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        model.rotation.y = 4.5;
        model.scale.set(65,25,65);
        if(window.innerWidth < 676){
            model.scale.set(35,25,35);
            model.position.set(0,-5,0);
        }

        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        camera.position.set(center.x+3, center.y + 8, center.z + 20);
        controls.target.copy(center);
        controls.update();
    });*/

    window.addEventListener('resize', onWindowResize);
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    time+=delta;
    if (mixer) mixer.update(delta);
    if(model){model.rotation.y += 0.005;}
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth*0.7, window.innerHeight);
}

var abrirBotones = document.querySelectorAll('a[id^="abrir-modal-"]');
    var cerrarBotones = document.querySelectorAll('.cerrar-modal');
    var modales = document.querySelectorAll('.modal');

    function abrirModal(modalId) {
        var modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }

    function cerrarModal(modalElement) {
        modalElement.style.display = 'none';
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
            if (modal) {
                cerrarModal(modal);
            }
        });
    });

    window.addEventListener('click', (event) => {
        modales.forEach(modal => {
            if (event.target === modal) {
                cerrarModal(modal);
            }
        });
    });
const menu = document.querySelector('#workarea');
const toggle = document.querySelector('.menu-toggle');

toggle.addEventListener('click', () => {
  menu.classList.toggle('workarea-open');
});