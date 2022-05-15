import * as THREE from '../build/three.module.js';
import { VertexNormalsHelper} from "../examples/jsm/helpers/VertexNormalsHelper.js"
import { OrbitControls } from "../examples/jsm/controls/OrbitControls.js";

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
        this._setupControls();  

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
        camera.position.z = 2;
        this._camera = camera;  //카메라 객체의 필드화
    }

    _setupLight () {
        const color = 0xffffff;  //광원의 색상
        const intensity = 1;   //광원의 세기
        const light = new THREE.DirectionalLight(color, intensity);  //광원 생성
        light.position.set(-1, 2, 4);  //광원 위치 설정
        this._scene.add(light);  //광원을 씬 객체에 추가
    }

    _setupModel () {
        //정점 정의
        const rawPositions = [
            -1, -1, 0,
            1, -1, 0,
            -1, 1, 0,
            1, 1, 0
        ];

        //normal 벡터 정의
        const rawNormals = [
            0, 0, 1, 
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ];

        //각 정점들의 색상값
        const rawColors = [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
            1, 1, 0
        ];
        //uv좌표
        const rawUVs = [
            0, 0,
            1, 0,
            0, 1,
            1, 1
        ];

        const positions = new Float32Array(rawPositions);//정점 배열을 Float32Array 클래스 객체로 랩핑
        const normals = new Float32Array(rawNormals);
        const colors = new Float32Array(rawColors);
        const uvs = new Float32Array(rawUVs);

        //geometry 생성
        const geometry = new THREE.BufferGeometry();

        //속성 설정
        //position
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3)); //geometry의 position 속성값 지정
        //Vertex index
        geometry.setIndex([
            0, 1, 2,     //1번 삼각형 
            2, 1, 3     //2번 삼각형
        ]);
        
        const textureLoader = new THREE.TextureLoader();
        const map = textureLoader.load('../examples/textures/uv_grid_opengl.jpg');

        //normal
        geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
        //color
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        //uv
        geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
        
        //material 생성
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff, 
            vertexColors: true,
            map: map,
        });

        //mesh 생성
        const box = new THREE.Mesh(geometry, material);
        this._scene.add(box);

        //normal 벡터 시각화
        const helper = new VertexNormalsHelper(box, 0.1, 0xffff00);
        this._scene.add(helper);
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