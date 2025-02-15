import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

let camera, scene, renderer;
let model, mixer;
let hitTestSource = null;
let hitTestSourceRequested = false;

// Создание сцены
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera();
renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// Кнопка входа в AR
document.body.appendChild(ARButton.createButton(renderer));

// Освещение
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040, 0.5));

// Загрузка модели GLB
const loader = new GLTFLoader();
loader.load(
    'ANIME.glb',
    (gltf) => {
        model = gltf.scene;
        model.visible = false; // Скрываем модель, пока не найдём плоскость
        scene.add(model);

        if (gltf.animations.length) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
                mixer.clipAction(clip).play();
            });
        }
    },
    undefined,
    (error) => console.error('Ошибка при загрузке модели:', error)
);

// Функция рендера
const clock = new THREE.Clock();
function animate() {
    renderer.setAnimationLoop((timestamp, frame) => {
        if (mixer) mixer.update(clock.getDelta());

        if (frame) {
            const referenceSpace = renderer.xr.getReferenceSpace();
            const session = renderer.xr.getSession();

            if (hitTestSourceRequested === false) {
                session.requestReferenceSpace('viewer').then((referenceSpace) => {
                    session.requestHitTestSource({ space: referenceSpace }).then((source) => {
                        hitTestSource = source;
                    });
                });

                session.addEventListener('end', () => {
                    hitTestSourceRequested = false;
                    hitTestSource = null;
                });

                hitTestSourceRequested = true;
            }

            if (hitTestSource) {
                const hitTestResults = frame.getHitTestResults(hitTestSource);
                if (hitTestResults.length > 0) {
                    const hit = hitTestResults[0];
                    const pose = hit.getPose(referenceSpace);

                    if (model) {
                        model.position.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
                        model.visible = true; // Показываем модель, когда нашли плоскость
                    }
                }
            }
        }

        renderer.render(scene, camera);
    });
}
animate();
