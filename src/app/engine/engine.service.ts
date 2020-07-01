import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import { Injectable, ElementRef, OnDestroy, NgZone } from '@angular/core';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

@Injectable({ providedIn: 'root' })
export class EngineService implements OnDestroy {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;
  private statue: any;
  private cube: THREE.Mesh;
  private controls: OrbitControls;
  private frameId: number = null;
  private domRef: HTMLElement;
  private textureCube: any;
  private textureLoader: any;
  private sphereMesh: any;
  private sphereGeo: any;
  private sphereMaterial: any;
  private cylRad: any;
  private cylinderGeo: any;
  private cylinderMesh: any;

  public constructor(private ngZone: NgZone) {}

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }
  public passDomRef(domref: HTMLElement){
    this.domRef = domref
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;
    
    /* this.loader.load(
      'assets/demo.glb',
      ( gltf ) => {
        // called when the resource is loaded
        console.log(gltf);
        this.statue = gltf.scene;
        console.log(this.statue.position)
        this.scene.add( gltf.scene.children[0] );
        console.log(this.statue);
  }); */
  
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // create the scene
    this.scene = new THREE.Scene();
    const fov = 75;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 200;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    this.camera.position.set(20, 0, 20);
    this.scene.add(this.camera);

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    this.controls.maxPolarAngle = 2;
    this.controls.minPolarAngle = 1;
    this.controls.autoRotate = true;
    
      
    // soft white light
    this.light = new THREE.AmbientLight(0x404040, 4.5 );
    this.light.position.z = 10;
    this.scene.add(this.light); 

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh( geometry, material );
    console.log(this.cube.position)
    this.scene.add(this.cube); 

    this.textureCube = new THREE.CubeTextureLoader().load([
      "https://i.ibb.co/60Dd6yx/posx.jpg",
      "https://i.ibb.co/JjgpZRp/negx.jpg",
      "https://i.ibb.co/w6y7MjT/posy.jpg",
      "https://i.ibb.co/3SkSn2w/negy.jpg",
      "https://i.ibb.co/T1swjxt/posz.jpg",
      "https://i.ibb.co/Ntq08N7/negz.jpg"
    ]);

    this.textureCube.format = THREE.RGBFormat;
    this.textureCube.mapping = THREE.CubeReflectionMapping;

    this.textureLoader = new THREE.TextureLoader();

    this.sphereGeo = new THREE.IcosahedronGeometry(10, 2);

    this.sphereMaterial = new THREE.MeshLambertMaterial({ envMap: this.textureCube });
    this.sphereMesh = new THREE.Mesh(this.sphereGeo, this.sphereMaterial);
    this.scene.add(this.sphereMesh);

    this.cylRad = 0.25;
    this.cylinderGeo = new THREE.CylinderBufferGeometry(
      this.cylRad,
      this.cylRad,
      this.cylRad * 20,
      10
    );
    var radius = 8;
    var yPos = 15;

    for (var rings = 0; rings < 10; rings++) {
      for (var angle = 0; angle < 2 * Math.PI; angle += Math.PI / 32.0) {
        for (var layers = -1; layers <= 1; layers += 2) {
          this.cylinderMesh = new THREE.Mesh(this.cylinderGeo, this.sphereMaterial);

          this.cylinderMesh.position.x = Math.sin(angle) * radius;
          this.cylinderMesh.position.y = yPos * layers;
          this.cylinderMesh.position.z = Math.cos(angle) * radius;

          this.scene.add(this.cylinderMesh);
        }
      }

      radius += 2;
      yPos += 0.5;
    }
    this.scene.background = this.textureCube;


  }

   public resizeRendererToDisplaySize() {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      this.renderer.setSize(width, height, false);
    }
    return needResize;
  } 
  

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render();
        });
      }

      window.addEventListener('resize', () => {
        this.resize();
      });
    });
  }

    public render(time?: number): void {
      this.frameId = requestAnimationFrame(() => {
        this.controls.update();
        var n = 2 * 0.001;
        const base = 1;
        const scale = 0.2;
         this.sphereMesh.scale.set(
           Math.sin(n) * scale + base,
          Math.sin(n) * scale + base,
          Math.sin(n) * scale + base 
        );
        if (this.resizeRendererToDisplaySize()) {
          const canvas = this.renderer.domElement;
          this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
          this.camera.updateProjectionMatrix();
        } 
        this.render();
      });

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.render);

    }

  public resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize( width, height );
  }

  public loader = new GLTFLoader();

}
