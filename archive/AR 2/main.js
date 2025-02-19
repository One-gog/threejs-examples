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

        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const scaleFactor = 400 / Math.max(size.x, size.y, size.z);
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);
        model.position.set(0, 0, -1);

        scene.add(model);

        if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
                mixer.clipAction(clip).play();
            });
        }
    });

    function animate() {
        if (mixer) mixer.update(clock.getDelta());
        renderer.setAnimationLoop(animate);
        renderer.render(scene, camera);
    }
    animate();
}
