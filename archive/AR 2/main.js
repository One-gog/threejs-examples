import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Создание сцены, камеры и рендера
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 5);
scene.background = new THREE.Color(0x87CEEB);


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Освещение
const light = new THREE.DirectionalLight(0x0000ff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Загрузка модели GLB
const loader = new GLTFLoader();
let mixer; // Переменная для управления анимацией

loader.load(
  'ANIME.glb', // Укажите путь к вашей модели
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Настройка анимации
    if (gltf.animations && gltf.animations.length) {
      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });
    }
  },
  (xhr) => {
    console.log(`Загрузка: ${(xhr.loaded / xhr.total) * 100}% завершено`);
  },
  (error) => {
    console.error('Ошибка при загрузке модели:', error);
  }
);

// Контролы
const controls = new OrbitControls(camera, renderer.domElement);

// Анимация рендера
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  // Обновление миксера анимации
  if (mixer) {
    mixer.update(clock.getDelta());
  }

  controls.update();
  renderer.render(scene, camera);
}




animate();
