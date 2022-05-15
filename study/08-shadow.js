import * as THREE from '../build/three.module.js';
import {OrbitControls} from '../examples/jsm/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from '../examples/jsm/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from '../examples/jsm/helpers/RectAreaLightHelper.js';


class App {
    constructor() {         //App 클래스 생성자
        const divContainer = document.querySelector("#webgl-container");  //id 저거인 태그 선택해서 divContainer 상수에 저장
        this._divContainer = divContainer;  //본 클래스의 필드로 재정의 (이유: divContainer를 다른 메서드에서 참조하기 위함)

        const renderer = new THREE.WebGLRenderer({ antialias: true});  //antialias(계단현상 노) 옵션으로 렌더러 객체 생성
        renderer.setPixelRatio(window.devicePixelRatio);  //픽셀 비율 설정 
        renderer.shadowMap.enabled = true;
        divContainer.appendChild(renderer.domElement);   //domElement를 자식으로 추가
        this._renderer = renderer;  //필드화

        const scene = new THREE.Scene();  //씬 객체 생성
        this._scene = scene;  //필드화

        this._setupCamera();  //카메라객체
        this._setupLight();    //광원 설정
        this._setupModel();  //3차원모델 셋업
        this._setupControls();  //컨트롤 설정 메서드

        window.onresize = this.resize.bind(this);  //창 크기 변경될 때 위한 resize 이벤트에 resize메서드 지정. bind 이유: this가 가리키는 것을 이벤트가 아닌 App 클래스로 하기 위함. 
        this.resize();      //렌더러나 카메라의 속성을 창 크기에 맞게 설정

        requestAnimationFrame(this.render.bind(this));  //requestAnimationFrame이 렌더 메서드를 적당한 시점에 호출
    }

    _setupControls() {
        new OrbitControls(this._camera, this._divContainer);
    }

    _setupCamera() {
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;
        const camera  = new THREE.PerspectiveCamera(  //카메라객체 생성
            75,
            width / height,
            0.1,
            100
        );
        //camera.position.z = 7;
        camera.position.set(7, 7, 0);  //카메라 배치 위치
        camera.lookAt(0, 0, 0); //카메라가 원점 바라보도록

        this._camera = camera;  //카메라 객체의 필드화
    }

    _setupLight () { 
        const auxLight = new THREE.DirectionalLight(0xffffff, 0.5);
        auxLight.position.set(0, 5, 0);
        auxLight.target.position.set(0, 0, 0);
        this._scene.add(auxLight.target);
        this._scene.add(auxLight);

        // const light = new THREE.DirectionalLight(0xffffff, 0.5);
        // light.position.set(0, 5, 0);
        // light.target.position.set(0,0,0);
        // this._scene.add(light.target);
        // light.shadow.camera.top = light.shadow.camera.right = 6;
        // light.shadow.camera.bottom = light.shadow.camera.left = -6;

        const light = new THREE.PointLight(0xffffff, 0.7);
        light.position.set(0, 5, 0);

        light.shadow.mapSize.width = light.shadow.mapSize.height = 2048;
        light.shadow.radius = 1;

        this._scene.add(light);
        this._light = light;    //참조 위해 필드화
        light.castShadow = true;
    }

    _setupModel () {
        //1. ground
        const groundGeometry = new THREE.PlaneGeometry(10, 30);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: "#2c3e50",
            roughness: 0.5,
            metalness: 0.5,
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.receiveShadow = true;
        ground.rotation.x = THREE.Math.degToRad(-90);   //x축 기준 -90도로 회전(한 번)
        this._scene.add(ground);

        //2. bigSphere
        //const bigSphereGeometry = new THREE.SphereGeometry(1.5, 64, 64, 0, Math.PI);    //수평 반구
        const bigSphereGeometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 64, 2, 3);     
        const bigSpehereMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.1,
            metalness: 0.2,
        });
        const bigSphere = new THREE.Mesh(bigSphereGeometry, bigSpehereMaterial);
        //bigSphere.rotation.x = THREE.Math.degToRad(-90);
        bigSphere.position.y = 1.6;
        bigSphere.castShadow = true;
        bigSphere.receiveShadow = true;
        this._scene.add(bigSphere);

        //3. torusPivot & torus
        const torusGeometry = new THREE.TorusGeometry(0.4, 0.1, 32, 32);
        const torusMaterial = new THREE.MeshStandardMaterial({
            color: "#9b59b6",
            roughness: 0.5,
            metalness: 0.9,
        });
        //torus 8개 만들기 위한 작업. 
        for(let i = 0; i < 8; i++) {
            const torusPivot = new THREE.Object3D(); //Object3D 객체도 8번 생성해야 한다.
            const torus = new THREE.Mesh(torusGeometry, torusMaterial);
            torusPivot.rotation.y = THREE.Math.degToRad(45 * i);    //8개를 360도에 균등하게 배치하기 위함
            torus.position.set(3, 0.5, 0);
            torusPivot.add(torus);  //Object3D 객체에 torus geometry 추가
            torus.receiveShadow = true;
            torus.castShadow = true;
            this._scene.add(torusPivot);
        }

        //4. smallSpherePivot & smallSphere
        const smallSphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
        const smallSphereMaterial = new THREE.MeshStandardMaterial({
            color: "#e74c4c",
            roughness: 0.2,
            metalness: 0.5,
        });
        const smallSpherePivot = new THREE.Object3D();
        const smallSphere = new THREE.Mesh(smallSphereGeometry, smallSphereMaterial);
        smallSpherePivot.add(smallSphere);
        smallSpherePivot.name = "smallSpherePivot";  //Object3D 객체에 이름 부여해두면 scene을 통해서 smallSpherePivot 을 언제든 조회 가능!
        smallSpherePivot.position.set(3, 0.5, 0);
        smallSphere.receiveShadow = true;
        smallSphere.castShadow = true;
        this._scene.add(smallSpherePivot);

    }

    resize() {//창 크기가 변경될 때의 메서드
        const width = this._divContainer.clientWidth;   //div 컨테이너(webgl-container) 의 속성값 가져와서
        const height = this._divContainer.clientHeight;

        this._camera.aspect = width / height;   //카메라의 속성값 설정
        this._camera.updateProjectionMatrix();

        this._renderer.setSize(width, height);  //렌더러의 크기 설정
    }

    render(time) { //렌더 메서드. time: 렌더링이 처음 시작된 이후 경과된 시간(ms)
        this._renderer.render(this._scene, this._camera);   //렌더러가 씬을 카메라의 시점으로 렌더링하라
        this.update(time);  //밑에서 메서드 정의
        requestAnimationFrame(this.render.bind(this));  //계속 렌더 메서드가 반복 호출되도록
    }

    update(time) {
        time *= 0.001;   //ms -> s 단위로 변경
        
        //회전 구현
        const smallSpherePivot = this._scene.getObjectByName("smallSpherePivot");
        if(smallSpherePivot) {
            smallSpherePivot.rotation.y = THREE.Math.degToRad(time * 50);   //y축 기준으로 회전(계속)
            
            if(this._light.target) {        //광원에 target 속성이 있을 때
                const smallSphere = smallSpherePivot.children[0];       //smallSphere을 가져온다
                smallSphere.getWorldPosition(this._light.target.position);  //smallSphere에 world 좌표계의 위치를 구해서 target으로 지정

                if(this._lightHelper) this._lightHelper.update();   //광원 헬퍼도 업데이트 해준다.
            }

            //pointLight
            if(this._light instanceof THREE.PointLight) {
                const smallSphere = smallSpherePivot.children[0];
                smallSphere.getWorldPosition(this._light.position)
            }
        }
    }
}


window.onload = function() {
    new App();
}