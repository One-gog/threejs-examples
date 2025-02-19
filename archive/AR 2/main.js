import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

if (isIOS) {
    const usdzUrl = 'ANIME.usdz';
    const arLink = document.createElement('a');
    arLink.rel = 'ar';
    arLink.href = usdzUrl;
    arLink.innerHTML = '👀 Открыть в AR';
    Object.assign(arLink.style, {
        position: 'absolute', top: '10px', left: '10px',
        padding: '10px', background: 'white', color: 'black',
        borderRadius: '5px'
    });
    document.body.appendChild(arLink);
} else {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.6, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    document.body.appendChild(ARButton.createButton(renderer));

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040, 0.5));

    const loader = new GLTFLoader();
    let model, mixer;
    const clock = new THREE.Clock();

    loader.load('ANIME.glb', (gltf) => {
        model = gltf.scene;
        scene.add(model);

        console.log('🔍 Загружена модель:', gltf);
        console.log('Объекты в сцене:', model.children.map(c => c.name));
        console.log('Анимации:', gltf.animations.map(a => a.name));

        // Проверяем, есть ли кости в модели
        model.traverse((obj) => {
            if (obj.isBone) {
                console.log('🦴 Найдена кость:', obj.name);
            }
        });

        if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
                console.log('🎬 Запускаем анимацию:', clip.name);
                const action = mixer.clipAction(clip);
                action.setLoop(THREE.LoopRepeat);
                action.play();
            });
        } else {
            console.warn('⚠️ В модели нет анимаций!');
        }
    });

    function animate() {
        const delta = clock.getDelta();
        if (mixer) {
            mixer.update(delta);
        }
        renderer.setAnimationLoop(animate);
        renderer.render(scene, camera);
    }
    animate();
}
