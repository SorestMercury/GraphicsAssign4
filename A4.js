/*
 * UTD CS 4361, Fall 2026
 * Assignment 4 Template
 */
import {
  setup,
  createScene,
  loadAndPlaceGLB,
  loadAndPlaceOBJ,
} from "./js/setup.js";
import * as THREE from "./js/three.module.js";
import { SourceLoader } from "./js/SourceLoader.js";
import { THREEx } from "./js/KeyboardState.js";

// Setup the renderer
// You should look into js/setup.js to see what exactly is done here.
const { renderer, canvas } = setup();

/////////////////////////////////
//   YOUR WORK STARTS BELOW    //
/////////////////////////////////

// Uniforms - Pass these into the appropriate vertex and fragment shader files
const spherePosition = { type: "v3", value: new THREE.Vector3(0.0, 0.0, 0.0) };
const tangentDirection = {
  type: "v3",
  value: new THREE.Vector3(0.5, 0.0, 1.0),
};

const ambientColor = { type: "c", value: new THREE.Color(1.0, 0.84, 0.0) }; // Gold ambient
const diffuseColor = { type: "c", value: new THREE.Color(1.0, 0.84, 0.2) }; // Goldish diffuse
const specularColor = { type: "c", value: new THREE.Color(1.0, 1.0, 1.0) };
const lightColor = { type: "c", value: new THREE.Color(1.0, 1.0, 1.0) };
const toonColor = { type: "c", value: new THREE.Color(1.0, 0.8, 0.4) };
const toonColor2 = { type: "c", value: new THREE.Color(0.8, 0.1, 0.35) };
const outlineColor = { type: "c", value: new THREE.Color(0.0, 0.0, 0.0) };

const kAmbient = { type: "f", value: 0.3 };
const kDiffuse = { type: "f", value: 0.6 };
const kSpecular = { type: "f", value: 1.0 };
const shininess = { type: "f", value: 50.0 };
const ticks = { type: "f", value: 0.0 };

const sphereLight = new THREE.PointLight(0xffffff, 200);

// Shader materials
const sphereMaterial = new THREE.ShaderMaterial({
  uniforms: {
    spherePosition: spherePosition,
  },
});

const blinnPhongMaterial = new THREE.ShaderMaterial({
  uniforms: {
    spherePosition: spherePosition,
    ambientColor: ambientColor,
    diffuseColor: diffuseColor,
    specularColor: specularColor,
    kAmbient: kAmbient,
    kDiffuse: kDiffuse,
    kSpecular: kSpecular,
    shininess: shininess,
  },
});

const toonMaterial = new THREE.ShaderMaterial({
  uniforms: {
    spherePosition: spherePosition,
    toonColor: toonColor,
    toonColor2: toonColor2,
    outlineColor: outlineColor,
  },
});

const dotsMaterial = new THREE.ShaderMaterial({
  uniforms: {
    spherePosition: spherePosition,
    ticks: ticks,
  },
});

// TODO: Load the helmet's texture images in gltf/ (Default_albedo.jpg, Default_normal.jpg,
// Default_AO.jpg, Default_metalRoughness.jpg, Default_emissive.jpg) using THREE.TextureLoader
const textureLoader = new THREE.TextureLoader();

const base = textureLoader.load('gltf/Default_albedo.jpg');
base.flipY = false;
base.wrapS = THREE.RepeatWrapping;
base.wrapT = THREE.RepeatWrapping;

const AO = textureLoader.load('gltf/Default_AO.jpg');
AO.flipY = false;
AO.wrapS = THREE.RepeatWrapping;
AO.wrapT = THREE.RepeatWrapping;

const emissiveMap = textureLoader.load('gltf/Default_emissive.jpg');
emissiveMap.flipY = false;
emissiveMap.wrapS = THREE.RepeatWrapping;
emissiveMap.wrapT = THREE.RepeatWrapping;

const emissive = new THREE.Color(1.0,0.0,1.0);
const metalRoughness = textureLoader.load('gltf/Default_metalRoughness.jpg');
metalRoughness.flipY = false;
metalRoughness.wrapS = THREE.RepeatWrapping;
metalRoughness.wrapT = THREE.RepeatWrapping;

const normal = textureLoader.load('gltf/Default_normal.jpg');
normal.flipY=false;
normal.wrapS = THREE.RepeatWrapping;
normal.wrapT = THREE.RepeatWrapping;

base.colorSpace = THREE.SRGBColorSpace;
emissiveMap.colorSpace = THREE.SRGBColorSpace;

const helmetPBRMaterial = new THREE.MeshStandardMaterial({
  // TODO: pass texture maps to the material. And set material's metalness.
  map: base,
  aoMap: AO,
  emissiveMap: emissiveMap,
  emissive: emissive,
  roughnessMap: metalRoughness,
  metalnessMap: metalRoughness,
  normalMap: normal,
  metalness: 1.0,
});

// Load shaders
const shaderFiles = [
  "glsl/sphere.vs.glsl",
  "glsl/sphere.fs.glsl",
  "glsl/blinn_phong.vs.glsl",
  "glsl/blinn_phong.fs.glsl",
  "glsl/toon.vs.glsl",
  "glsl/toon.fs.glsl",
  "glsl/dots.vs.glsl",
  "glsl/dots.fs.glsl",
];

new SourceLoader().load(shaderFiles, function (shaders) {
  sphereMaterial.vertexShader = shaders["glsl/sphere.vs.glsl"];
  sphereMaterial.fragmentShader = shaders["glsl/sphere.fs.glsl"];

  blinnPhongMaterial.vertexShader = shaders["glsl/blinn_phong.vs.glsl"];
  blinnPhongMaterial.fragmentShader = shaders["glsl/blinn_phong.fs.glsl"];

  toonMaterial.vertexShader = shaders["glsl/toon.vs.glsl"];
  toonMaterial.fragmentShader = shaders["glsl/toon.fs.glsl"];

  dotsMaterial.vertexShader = shaders["glsl/dots.vs.glsl"];
  dotsMaterial.fragmentShader = shaders["glsl/dots.fs.glsl"];
});

// Define the shader modes
const shaders = {
  BLINNPHONG: { key: 0, material: blinnPhongMaterial },
  TOON: { key: 1, material: toonMaterial },
  DOTS: { key: 2, material: dotsMaterial },
  PBR: { key: 3, material: helmetPBRMaterial },
};

let mode = shaders.BLINNPHONG.key; // Default

// Set up scenes
let scenes = [];
for (let shader of Object.values(shaders)) {
  // Create the scene
  const { scene, camera, worldFrame } = createScene(canvas, renderer);

  // Create the main sphere geometry (light source)
  // https://threejs.org/docs/#api/en/geometries/SphereGeometry
  const sphereGeometry = new THREE.SphereGeometry(1.0, 32.0, 32.0);
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(0.0, 1.5, 0.0);
  sphere.parent = worldFrame;
  scene.add(sphere);

  // Load the damaged helmet, for scene key 4.
  if (shader.material == helmetPBRMaterial) {
    loadAndPlaceGLB("gltf/DamagedHelmet.gltf", shader.material, function (helmet) {
      helmet.position.set(12.0, 0.0, 0.0);
      helmet.rotation.y = -Math.PI / 3;
      helmet.scale.set(10.0, 10.0, 10.0);
      helmet.parent = worldFrame;

      helmet.traverse(child => {
        if (child.isMesh) child.material = helmetPBRMaterial;
      });
      scene.add(helmet);
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 3.0);
    scene.add(ambientLight);

    sphereLight.parent = worldFrame;
    scene.add(sphereLight);
  } else {
    // If there's no helmet, then only place the dragon, i.e. keys 1, 2, 3
    loadAndPlaceOBJ("obj/dragon.obj", shader.material, function (dragon) {
      dragon.position.set(-5.0, 0.0, -5.0);
      dragon.rotation.x = -Math.PI/2;
      dragon.scale.set(0.5, 0.5, 0.5);
      dragon.parent = worldFrame;
      scene.add(dragon);
    });
  }

  scenes.push({ scene, camera });
}

// Listen to keyboard events.
const keyboard = new THREEx.KeyboardState();
function checkKeyboard() {
  if (keyboard.pressed("1")) mode = shaders.BLINNPHONG.key;
  else if (keyboard.pressed("2")) mode = shaders.TOON.key;
  else if (keyboard.pressed("3")) mode = shaders.DOTS.key;
  else if (keyboard.pressed("4")) mode = shaders.PBR.key;

  if (keyboard.pressed("W")) spherePosition.value.z -= 0.3;
  else if (keyboard.pressed("S")) spherePosition.value.z += 0.3;

  if (keyboard.pressed("A")) spherePosition.value.x -= 0.3;
  else if (keyboard.pressed("D")) spherePosition.value.x += 0.3;

  if (keyboard.pressed("E")) spherePosition.value.y -= 0.3;
  else if (keyboard.pressed("Q")) spherePosition.value.y += 0.3;

  sphereLight.position.set(
    spherePosition.value.x,
    spherePosition.value.y,
    spherePosition.value.z
  );

  // The following tells three.js that some uniforms might have changed
  sphereMaterial.needsUpdate = true;
  blinnPhongMaterial.needsUpdate = true;
  helmetPBRMaterial.needsUpdate = true;
  toonMaterial.needsUpdate = true;
  dotsMaterial.needsUpdate = true;
}

// clock = THREE.Clock;

// Setup update callback
function update() {
  checkKeyboard();
  ticks.value += 1 / 100.0;

  // Requests the next update call, this creates a loop
  requestAnimationFrame(update);
  const { scene, camera } = scenes[mode];
  renderer.render(scene, camera);
}

// Start the animation loop.
update();
