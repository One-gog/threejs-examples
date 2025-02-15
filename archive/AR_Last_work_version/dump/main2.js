import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(ARButton.createButton(renderer));

const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.visible = true;  // Зробити куб видимим на початковій сторінці
scene.add(cube);

// Віртуальні кнопки в сцені
const buttonGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.01);
const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

const scaleUpButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
scaleUpButton.position.set(-0.2, 0.2, -0.5);
scaleUpButton.visible = false;
scene.add(scaleUpButton);

const scaleDownButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
scaleDownButton.position.set(0, 0.2, -0.5);
scaleDownButton.visible = false;
scene.add(scaleDownButton);

const rotateButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
rotateButton.position.set(0.2, 0.2, -0.5);
rotateButton.visible = false;
scene.add(rotateButton);

// Створення екранних кнопок
const controlsDiv = document.createElement('div');
controlsDiv.style.position = 'absolute';
controlsDiv.style.top = '10px';
controlsDiv.style.left = '10px';
controlsDiv.style.zIndex = '100';
controlsDiv.style.display = 'block'; // Показує кнопки на початку
controlsDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
controlsDiv.style.padding = '10px';
document.body.appendChild(controlsDiv);

function createButton(text, onClick) {
    const button = document.createElement('button');
    button.innerText = text;
    button.style.margin = '5px';
    button.style.padding = '10px';
    button.addEventListener('click', onClick);
    controlsDiv.appendChild(button);
}

createButton('Rotate', () => {
    cube.rotation.y += Math.PI / 4;
});

createButton('Scale Up', () => {
    cube.scale.multiplyScalar(1.2);
});

createButton('Scale Down', () => {
    cube.scale.multiplyScalar(0.8);
});

let isAnimating = false;
createButton('Start Animation', () => {
    isAnimating = !isAnimating;
});

function animate() {
    if (isAnimating) {
        cube.rotation.y += 0.01;
        cube.rotation.x += 0.01;
    }
    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
}
animate();

// Додавання об'єкта за натисканням
const controller = renderer.xr.getController(0);
controller.addEventListener('select', () => {
    cube.position.set(0, 0, -0.5).applyMatrix4(controller.matrixWorld);
    cube.visible = true;
    scaleUpButton.visible = true;
    scaleDownButton.visible = true;
    rotateButton.visible = true;
    controlsDiv.style.display = 'none'; // Приховуємо екранні кнопки у AR
});
scene.add(controller);

// Взаємодія з об'єктами в AR
const raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();

controller.addEventListener('selectstart', () => {
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const intersects = raycaster.intersectObjects([cube, scaleUpButton, scaleDownButton, rotateButton]);

    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        if (selectedObject === cube) {
            cube.rotation.y += Math.PI / 4;
        } else if (selectedObject === scaleUpButton) {
            cube.scale.multiplyScalar(1.2);
        } else if (selectedObject === scaleDownButton) {
            cube.scale.multiplyScalar(0.8);
        } else if (selectedObject === rotateButton) {
            cube.rotation.y += Math.PI / 4;
        }
    }
});
scene.add(controller);
