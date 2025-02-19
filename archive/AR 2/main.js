import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

console.log('📱 WebXR поддерживается:', navigator.xr);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.6, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// ✅ Исправленный ARButton с WebXR-проверкой
if (navigator.xr) {
    const arButton = ARButton.createButton(renderer);
    document.body.appendChild(arButton);
} else {
    console.warn('⚠️ WebXR не поддерживается на этом устройстве!');
}

// ✅ Освещение
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040, 0.5));

// ✅ Загрузка GLB-модели
const loader = new GLTFLoader();
let model, mixer, actions = {};
const clock = new THREE.Clock();

loader.load('ANIME.glb', (gltf) => {
    model = gltf.scene;
    scene.add(model);

    console.log('📦 Загруженный GLTF:', gltf);
    console.log('🎬 Найдено анимаций:', gltf.animations.map(a => a.name));

    if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
            console.log(`🎬 Анимация: ${clip.name}`);
            const action = mixer.clipAction(clip);
            action.setLoop(THREE.LoopRepeat);
            actions[clip.name] = action;
        });

        // ✅ Принудительно запускаем первую анимацию
        const firstAnimation = gltf.animations[0].name;
        console.log(`⏯ Принудительно запускаем анимацию: ${firstAnimation}`);
        actions[firstAnimation].play();
    } else {
        console.warn('⚠️ В модели нет анимаций!');
    }
});

// ✅ WebXR: обновление анимации
function animate() {
    const delta = clock.getDelta();
    if (mixer) {
        mixer.update(delta);
    }
    renderer.render(scene, camera);
}

// ✅ Принудительное обновление WebXR
renderer.setAnimationLoop(() => {
    animate();
});

// ✅ Фикс для WebXR (Safari + Android): анимация стартует при входе в AR
renderer.xr.addEventListener('sessionstart', () => {
    console.log('🚀 Вход в WebXR: включаем анимацию');
    if (mixer && Object.keys(actions).length > 0) {
        Object.values(actions).forEach(action => action.play());
    }
});

// 🔘 КНОПКА ДЛЯ ВКЛЮЧЕНИЯ АНИМАЦИИ ВРУЧНУЮ
const button = document.createElement('button');
button.innerHTML = '▶ Запустить анимацию';
Object.assign(button.style, {
    position: 'absolute', bottom: '10px', left: '10px',
    padding: '10px 20px', background: '#28a745', color: 'white',
    fontSize: '16px', border: 'none', borderRadius: '5px',
    cursor: 'pointer'
});

button.onclick = () => {
    console.log('🔘 Включаем анимацию вручную');
    if (mixer && Object.keys(actions).length > 0) {
        Object.values(actions).forEach(action => action.play());
    } else {
        console.warn('⚠️ Анимация еще не загружена!');
    }
};

document.body.appendChild(button);
