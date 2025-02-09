import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

// Проверяем, iOS или нет
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

// Если iPhone → Открываем AR Quick Look
if (isIOS) {
    const usdzUrl = 'ANIME.usdz'; // USDZ-модель (экспортируй из Blender)
    const arLink = document.createElement('a');
    arLink.rel = 'ar';
    arLink.href = usdzUrl;
    arLink.innerHTML = '👀 Открыть в AR';
    arLink.style.position = 'absolute';
    arLink.style.top = '10px';
    arLink.style.left = '10px';
    arLink.style.padding = '10px';
    arLink.style.background = 'white';
    arLink.style.color = 'black';
    arLink.style.borderRadius = '5px';
    document.body.appendChild(arLink);
} else {
    // WebXR для Android
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

    // Загрузка модели GLB
    const loader = new GLTFLoader();
    let model, mixer;

    loader.load(
        'ANIME.glb', // Укажите путь к модели
        (gltf) => {
            model = gltf.scene;
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
}
