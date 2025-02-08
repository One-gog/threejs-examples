import * as THREE from 'https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js';

// Создаем сцену
const scene = new THREE.Scene();

// Камера
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

// Рендерер
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Куб
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Освещение
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Новый рассеянный свет
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 2, 100); // Увеличил интенсивность
pointLight.position.set(2, 2, 3);
scene.add(pointLight);

// Анимация
function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();

// Адаптация под размер экрана
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
