import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

// Создаём сцену
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// Добавляем AR-кнопку
document.body.appendChild(ARButton.createButton(renderer));

// Освещение
const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(5, 10, 7.5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040, 0.5));

// Проверяем, что Three.js работает – добавляем тестовый куб
const testCube = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.2),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
testCube.position.set(0, 1, -1);
scene.add(testCube);

// Загружаем 3D модель
const loader = new GLTFLoader();
let model = null;

loader.load(
    'ANIME.glb',
    (gltf) => {
        model = gltf.scene;
        model.visible = false;
        model.scale.set(0.5, 0.5, 0.5);
        scene.add(model);
        console.log('Модель загружена');
    },
    undefined,
    (error) => console.error('Ошибка загрузки модели:', error)
);

// Настройка hit-test для AR
let hitTestSource = null;
let hitTestSourceRequested = false;

renderer.setAnimationLoop((time, frame) => {
    if (!frame) return;

    const session = renderer.xr.getSession();
    if (session) {
        if (!hitTestSourceRequested) {
            session.requestReferenceSpace('viewer').then((referenceSpace) => {
                session.requestHitTestSource({ space: referenceSpace }).then((source) => {
                    hitTestSource = source;
                });
            });
            hitTestSourceRequested = true;
        }

        if (hitTestSource) {
            const referenceSpace = renderer.xr.getReferenceSpace();
            const hitTestResults = frame.getHitTestResults(hitTestSource);

            if (hitTestResults.length > 0 && model) {
                const hit = hitTestResults[0];
                const pose = hit.getPose(referenceSpace);
                model.position.set(
                    pose.transform.position.x,
                    pose.transform.position.y,
                    pose.transform.position.z
                );
                model.visible = true;
            }
        }
    }

    renderer.render(scene, camera);
});
