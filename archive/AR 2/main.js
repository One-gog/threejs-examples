// Проверяем, iOS или нет
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

if (isIOS) {
    // ✅ iPhone → AR Quick Look
    const usdzUrl = 'models/ANIME.usdz';
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
    // ✅ WebXR (Android)
    let scene, camera, renderer, model, mixer;
    let reticle; // Hit-test метка
    let controller;

    function init() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 20);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;
        document.body.appendChild(renderer.domElement);

        // ✅ Кнопка "Enter AR"
        document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

        // ✅ Освещение
        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);

        // ✅ Hit-Test метка
        const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        reticle = new THREE.Mesh(geometry, material);
        reticle.visible = false;
        scene.add(reticle);

        // ✅ Контроллер (отслеживает касания)
        controller = renderer.xr.getController(0);
        controller.addEventListener('select', onSelect);
        scene.add(controller);

        // ✅ Загрузка модели GLB
        const loader = new THREE.GLTFLoader();
        loader.load(
            'models/ANIME.glb',
            (gltf) => {
                model = gltf.scene;
                model.scale.set(0.3, 0.3, 0.3);
                model.visible = false;
                scene.add(model);

                if (gltf.animations.length) {
                    mixer = new THREE.AnimationMixer(model);
                    gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
                }
            },
            (xhr) => console.log(`Загрузка: ${(xhr.loaded / xhr.total) * 100}% завершено`),
            (error) => console.error('Ошибка загрузки модели:', error)
        );

        // ✅ Обновление AR сцены
        renderer.setAnimationLoop(render);
    }

    function onSelect() {
        if (reticle.visible && model) {
            model.position.setFromMatrixPosition(reticle.matrix);
            model.visible = true;
        }
    }

    function render(timestamp, frame) {
        if (mixer) mixer.update(0.016); // Анимация

        if (frame) {
            const referenceSpace = renderer.xr.getReferenceSpace();
            const session = renderer.xr.getSession();

            if (session.requestReferenceSpace && session.requestHitTestSource) {
                session.requestReferenceSpace('viewer').then((space) => {
                    session.requestHitTestSource({ space }).then((source) => {
                        frame.getHitTestResults(source).forEach((hit) => {
                            const pose = hit.getPose(referenceSpace);
                            reticle.visible = true;
                            reticle.matrix.fromArray(pose.transform.matrix);
                        });
                    });
                });
            }
        }

        renderer.render(scene, camera);
    }

    init();
}
