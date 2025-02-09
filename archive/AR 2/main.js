import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

// Создание сцены
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// Добавляем кнопку "Enter AR"
document.body.appendChild(ARButton.createButton(renderer));

// Освещение
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040, 0.5));

// Переменная для модели и анимации
let model, mixer;

// Raycaster для размещения модели на полу
const raycaster = new THREE.Raycaster();
const touchPoint = new THREE.Vector2();
const controller = renderer.xr.getController(0);
scene.add(controller);

controller.addEventListener('select', () => {
    if (!model) return;

    raycaster.setFromCamera(touchPoint, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        model.position.copy(intersects[0].point);
        model.visible = true;
    }
});

// Загрузка модели GLB
const loader = new GLTFLoader();
loader.load(
    'ANIME.glb', // Укажите путь к вашей модели
    (gltf) => {
        model = gltf.scene;
        model.visible = false; // По умолчанию скрываем, пока не будет выбрано место
        scene.add(model);

        if (gltf.animations.length) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
                mixer.clipAction(clip).play();
            });
        }
    },
    (xhr) => console.log(`Загрузка: ${(xhr.loaded / xhr.total) * 100}% завершено`),
    (error) => console.error('Ошибка при загрузке модели:', error)
);

// Анимация
const clock = new THREE.Clock();
function animate() {
    renderer.setAnimationLoop(() => {
        if (mixer) mixer.update(clock.getDelta());
        renderer.render(scene, camera);
    });
}
animate();
