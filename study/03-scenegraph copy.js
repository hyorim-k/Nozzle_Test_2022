import * as THREE from '../build/three.module.js';

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

        window.onresize = this.resize.bind(this);  //창 크기 변경될 때 위한 resize 이벤트에 resize메서드 지정. bind 이유: this가 가리키는 것을 이벤트가 아닌 App 클래스로 하기 위함. 
        this.resize();      //렌더러나 카메라의 속성을 창 크기에 맞게 설정

        requestAnimationFrame(this.render.bind(this));  //requestAnimationFrame이 렌더 메서드를 적당한 시점에 호출
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
        camera.position.z = 25;
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
        const solarSystem = new THREE.Object3D(); //solarSystem 객체 생ㅓ
        this._scene.add(solarSystem);   //씬에 추가

        //구 모양의 geometry생성
        const radius = 1;
        const widthSegments = 12;
        const heightSegments = 12;
        const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

        //sun 재질
        const sunMaterial = new THREE.MeshPhongMaterial({
            emissive: 0xffff00, flatShading: true});

        //sunMesh 생성
        const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
        sunMesh.scale.set(3, 3, 3); //sunMesh의 scale 속성값
        solarSystem.add(sunMesh);   //object3D객체에 썬 추가

        //earthOrbit 객체 생성 및 자식으로 추가
        const earthOrbit = new THREE.Object3D();
        solarSystem.add(earthOrbit);

        //earthMesh 객체 생성
        //재질
        const earthMaterial = new THREE.MeshPhongMaterial({
            color: 0x2233ff, emissive: 0x112244, flatShading: true
        });
        //Mesh
        const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
        earthOrbit.position.x = 10; //태양기준 x축으로 10만큼 떨어진 위치에 지구 배치
        earthOrbit.add(earthMesh);  //earthMesh를 자식으로 추가

        //moonOrbit 객체 생성
        const moonOrbit = new THREE.Object3D();
        earthOrbit.add(moonOrbit);  //earth 자식으로 추가
        moonOrbit.position.x = 2;   //earthOrbit기준으로 x축으로 2만큼 떨어진 거리에 달 배치 (==태양과의 거리는 12가 됨)
        
        //moonMesh 객체 생성
        //재질
        const moonMaterial = new THREE.MeshPhongMaterial({
            color: 0x888888, emissive: 0x222222, flatShading: true
        });
        //Mesh
        const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
        moonMesh.scale.set(0.5, 0.5, 0.5);
        moonOrbit.add(moonMesh);    //moonOrbit의 자식으로 추가
        
        this._solarSystem = solarSystem;    //solarSystem을 다른 메서드에서 접근할 수 있도록 필드화
        this._earthOrbit = earthOrbit;
        this._moonOrbit = moonOrbit;
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

        //태양의 자전과 태양 중심으로의 공전
        this._solarSystem.rotation.y = time / 2;  //y 축에 대한 회전 값에 time /2을 지정 -> 시간은 계속 변하므로 y축에 대해 연속적으로 회전함
        
        //지구의 자전
        this._earthOrbit.rotation.y = time *2;  //y축 기준 회전
        //달의 자전
        this._moonOrbit.rotation.y = time * 5;
    }
}


window.onload = function() {
    new App();
}