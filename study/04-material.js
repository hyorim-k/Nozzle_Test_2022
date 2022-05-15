import * as THREE from '../build/three.module.js';
import { OrbitControls } from '../examples/jsm/controls/OrbitControls.js'  //마우스 조작 위해 추가
import { VertexNormalsHelper } from "../examples/jsm/helpers/VertexNormalsHelper.js" //법선벡터 시각화 위해 클래스 추가

class App {
    constructor() {         //App 클래스 생성자
        const divContainer = document.querySelector("#webgl-container");  //id 저거인 태그 선택해서 divContainer 상수에 저장
        this._divContainer = divContainer;  //본 클래스의 필드로 재정의 (이유: divContainer를 다른 메서드에서 참조하기 위함)

        const renderer = new THREE.WebGLRenderer({ antialias: true});  //antialias(계단현상 노) 옵션으로 렌더러 객체 생성
        renderer.setPixelRatio(window.devicePixelRatio);  //픽셀 비율 설정 
        divContainer.appendChild(renderer.domElement);   //domElement를 자식으로 추가
        this._renderer = renderer;  //필드화

        const scene = new THREE.Scene();  //씬 객체 생성
        this._scene = scene;  //필드화

        this._setupCamera();  //카메라객체
        this._setupLight();    //광원 설정
        this._setupModel();  //3차원모델 셋업
        this._setupControls();  //마우스 조작

        window.onresize = this.resize.bind(this);  //창 크기 변경될 때 위한 resize 이벤트에 resize메서드 지정. bind 이유: this가 가리키는 것을 이벤트가 아닌 App 클래스로 하기 위함. 
        this.resize();      //렌더러나 카메라의 속성을 창 크기에 맞게 설정

        requestAnimationFrame(this.render.bind(this));  //requestAnimationFrame이 렌더 메서드를 적당한 시점에 호출
    }

    _setupControls() {   //마우스 컨트롤
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
        camera.position.z = 3;
        this._camera = camera;  //카메라 객체의 필드화
        this._scene.add(camera);
    }

    _setupLight () {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this._scene.add(ambientLight);

        const color = 0xffffff;  //광원의 색상
        const intensity = 1;   //광원의 세기
        const light = new THREE.DirectionalLight(color, intensity);  //광원 생성
        light.position.set(-1, 2, 4);  //광원 위치 설정
        //this._scene.add(light);  //광원을 씬 객체에 추가
        this._camera.add(light);
    }

    _setupModel () {
        //texture 객체 생성하기
        const textureLoader = new THREE.TextureLoader(); //1. TextureLoader 클래스 객체 생성
        const map = textureLoader.load("images/glass/Glass_Window_002_basecolor.jpg");
        const mapAO = textureLoader.load("images/glass/Glass_Window_002_ambientOcclusion.jpg");
        const mapHeight = textureLoader.load("images/glass/Glass_Window_002_height.png");
        const mapNormal = textureLoader.load("images/glass/Glass_Window_002_normal.jpg");
        const mapRoughness = textureLoader.load("images/glass/Glass_Window_002_roughness.jpg");
        const mapMetalic = textureLoader.load("images/glass/Glass_Window_002_metallic.jpg");
        const mapAlpha = textureLoader.load("images/glass/Glass_Window_002_opacity.jpg");
        const mapLight = textureLoader.load("images/glass/light.jpeg");

        //material
        const material = new THREE.MeshStandardMaterial({
            map : map,   //map 속성에 texture 객체를 지정
            normalMap: mapNormal,
            displacementMap: mapHeight,
            displacementScale: 0.2,         //변위 규모 조절
            displacementBias: -0.15,        //변위 편차 조정->벌어진 면 붙이기

            aoMap: mapAO,   //음영
            aoMapIntensity: 3,  //음영 강도값 (기본값 1)

            roughnessMap: mapRoughness, //거칠기
            roughness: 0.5,         //거칠기 강도 (기본 1)

            metalnessMap: mapMetalic,  //금속성
            metalness: 0.5,     //금속성 강도(기본 0)

            alphaMap: mapAlpha,  //투명도(opacity)
            transparent: true,  //투명도 활성화 필요 
            side: THREE.DoubleSide, //뒷면도 동시에 렌더링되도록해서 뒷면까지 투명해지는거 방지
            
            lightMap: mapLight,
            lightMapIntensity: 3,

        });

        //Mesh
        const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1, 256, 256, 256), material);
        box.position.set(-1, 0, 0);
        box.geometry.attributes.uv2 = box.geometry.attributes.uv;
        this._scene.add(box);

        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.7, 512, 512), material);
        sphere.position.set(1, 0, 0);
        sphere.geometry.attributes.uv2 = sphere.geometry.attributes.uv;
        this._scene.add(sphere);

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
    }
}


window.onload = function() {
    new App();
}