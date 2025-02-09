import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

// Создание сцены
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Голубое небо

// Камера
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 5);

// Рендерер с поддержкой WebXR
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true; // Включаем поддержку WebXR
document.body.appendChild(renderer.domElement);

// Добавляем AR-кнопку
document.body.appendChild(ARButton.createButton(renderer));

// Освещение
const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(5, 10, 7.5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Загрузка модели
const loader = new GLTFLoader();
let mixer = null;
let model = null;

loader.load(
  'ANIME.glb', // Укажи путь к модели
  (gltf) => {
    model = gltf.scene;
    scene.add(model);

    // Настройка позиции и масштаба
    model.position.set(0, 0, -2); // Чуть дальше от пользователя
    model.scale.set(1, 1, 1);

    console.log('Модель загружена:', model);

    // Анимация
    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });
    }
  },
  (xhr) => {
    console.log(`Загрузка: ${((xhr.loaded / xhr.total) * 100).toFixed(2)}%`);
  },
  (error) => {
    console.error('Ошибка загрузки модели:', error);
  }
);

// Контролы камеры (работают только в 3D-режиме, в AR не нужны)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Обработчик изменения размера окна
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Анимация сцены
const clock = new THREE.Clock();

function animate() {
  renderer.setAnimationLoop(() => {
    if (mixer) {
      mixer.update(clock.getDelta());
    }

    controls.update();
    renderer.render(scene, camera);
  });
}

animate();
