import * as THREE from '../build/three.module.js';
import { OrbitControls } from '../examples/jsm/controls/OrbitControls.js';  //마우스 사용 회전 위해 OrbitControls 클래스 추가
import {FontLoader} from "../examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "../examples/jsm/geometries/TextGeometry.js";

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
        this._setupControls(); //OrbitControls와 같은 controls를 정의하는데 사용하는 메서드

        window.onresize = this.resize.bind(this);  //창 크기 변경될 때 위한 resize 이벤트에 resize메서드 지정. bind 이유: this가 가리키는 것을 이벤트가 아닌 App 클래스로 하기 위함. 
        this.resize();      //렌더러나 카메라의 속성을 창 크기에 맞게 설정

        requestAnimationFrame(this.render.bind(this));  //requestAnimationFrame이 렌더 메서드를 적당한 시점에 호출
    }

    _setupControls() {
        new OrbitControls(this._camera, this._divContainer);  //카메라와 이벤트를 받는 dom 요소를 매개변수로 하여 OrbitControls 객체 생성
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
        camera.position.x = -15;
        camera.position.z = 15;  //카메라가 얼마나 멀리 떨어져 있는지
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
        const fontLoader = new FontLoader(); //폰트로더 클래스 객체 생성
        //폰트 데이터를 비동기적으로 로드하기 위한 loadFoant 비동기 함수 추가
        async function loadFoant(that) {
            const url = '../examples/fonts/helvetiker_regular.typeface.json';
            const font = await new Promise((resolve, reject) => {
                fontLoader.load(url, resolve, undefined, reject);
            });

            const geometry = new TextGeometry("GIS", {
                font: font,
                size: 5, 
                height: 1.5, 
                curveSegments: 3,
                //ExtrudeGeometry위한 설정값
                bevelEnabled: true,
                bevelThickness: 0.7, 
                bevelSize: .7,
                bevelSegments: 2
            });

            const fillMaterial = new THREE.MeshPhongMaterial({color: 0x515151}); //회색 재질
            const cube = new THREE.Mesh(geometry, fillMaterial); //큐브 메쉬 객체 생성

            const lineMaterial = new THREE.LineBasicMaterial({color: 0xffff00}); //노란색 라인 재질
            const line = new THREE.LineSegments(  //앞의 지오메트리 사용해 line 타입의 객체 생성
                new THREE.WireframeGeometry(geometry), lineMaterial  //와이어프레임지오메트리 사용 이유: 해당 지오메트리의 모든 윤곽선 표현 위함
            );
            
            const group = new THREE.Group()   //그룹객체 생성
            group.add(cube);  //큐브객체와 라인 객체를 그룹으로 묶음
            group.add(line);

            that._scene.add(group);  //이 그룹을 씬에 추가
            that._cube = group;   

        };
        loadFoant(this); //비동기 함수 호출
    }

    // _setupModel() {
    //     class CustomeSinCurve extends THREE.Curve { //Curve 클래스를 상속받아 CustomSinCurve 클래스를 새로 정의, 커브를 t 매개변수 방정식으로 정의하는 클래스임
    //         constructor(scale) {  //생성자
    //             super();
    //             this.scale = scale;
    //         }
    //         getPoint(t) {  //0~1 사이의 t값에 대한 커브의 구성 좌표 계산 가능
    //             const tx = t * 3 - 1.5;
    //             const ty = Math.sin(2 * Math.PI * t);
    //             const tz = 0;
    //             return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
    //         }
    //     }
    //     const path = new CustomeSinCurve(4);

    //     const geometry = new THREE.BufferGeometry();
    //     const points = path.getPoints(30); //커브를 구성하는 좌표의 개수. 기본값 5, 숫자 클수록 부드러운 곡선 만듦
    //     geometry.setFromPoints(points);

    //     const material = new THREE.LineBasicMaterial({color: 0xffff00});
    //     const line = new THREE.Line(geometry, material);

    //     this._scene.add(line);
    // }
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
        
        //this._cube.rotation.x = time;  //시간값을 큐브 모델의 x,y 축에 대한 회전 값에 time값을 지정 -> 시간은 계속 변하므로,  
        //this._cube.rotation.y = time; //x, y축으로 큐브가 계속 회전하게 됨
    }
}


window.onload = function() {
    new App();
}