import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// 1️⃣ Создаём сцену, камеру и рендерер
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 20);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// 2️⃣ Добавляем кнопку "Enter AR"
document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

// 3️⃣ Освещение
const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
scene.add(light);

// 4️⃣ Загружаем модель
let model, mixer;
const loader = new GLTFLoader();
loader.load(
    'models/ANIME.glb', 
    (gltf) => {
        model = gltf.scene;
        model.scale.set(0.3, 0.3, 0.3);
        model.visible = false;
        scene.add(model);

        // Запускаем анимацию, если есть
        if (gltf.animations.length) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
        }
    },
    (xhr) => console.log(`Загрузка: ${(xhr.loaded / xhr.total) * 100}% завершено`),
    (error) => console.error('Ошибка загрузки модели:', error)
);

// 5️⃣ Добавляем Hit-Test для размещения модели
let reticle; // Индикатор точки, где появится модель
let controller;

const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
reticle = new THREE.Mesh(geometry, material);
reticle.visible = false;
scene.add(reticle);

// Контроллер (отслеживает нажатия)
controller = renderer.xr.getController(0);
controller.addEventListener('select', onSelect);
scene.add(controller);

function onSelect() {
    if (reticle.visible && model) {
        model.position.setFromMatrixPosition(reticle.matrix);
        model.visible = true;
    }
}

// 6️⃣ Анимация сцены
const clock = new THREE.Clock();

renderer.setAnimationLoop((timestamp, frame) => {
    if (mixer) mixer.update(clock.getDelta());

    if (frame) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();

        if (session.requestReferenceSpace && session.requestHitTestSource) {
            session.requestReferenceSpace('viewer').then((space) => {
                session.requestHitTestSource({ space }).then((source) => {
                    frame.getHitTestResults(source).forEach((hit) => {
                        const pose = hit.getPose(referenceSpace);
                        reticle.visible = true;
                        reticle.matrix.fromArray(pose.transform.matrix);
                    });
                });
            });
        }
    }

    renderer.render(scene, camera);
});
