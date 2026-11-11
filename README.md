# CS 4361 Assignment 4: Shaders

**Student Name:** Dylan Horton
**Student Number:** 2021706202
**NetID:** DRH220003

## Assignment Overview

This assignment implements several shading algorithms in GLSL and Three.js: Blinn-Phong reflection and toon shading on the dragon, animated polka dots, and physically based rendering (PBR) of a textured helmet with `MeshStandardMaterial`.

## Part 1: Required Features (100 pts)

### (a) Scene 1: Blinn-Phong Reflection (25 pts)

**Requirements:**
- Pass the needed values (position, normal, view position) from the vertex shader to the fragment shader
- Compute the ambient, diffuse and specular terms per fragment and sum them, as in Figure 3

**Implementation:**
I wanted to be able to interpolate the normal with normalMatrix * normal, so I decided to work in view space. the normalMatrix is the inverse transpose of the modelViewMatrix, so it translates the normal into view space. View space also allows us to easily compute the direction of the camera from a given point, because in view space the camera is at 0,0,0. So to get a vector that points directly at 0,0,0, we can do 0,0,0-viewPosition, which is just -viewPosition. This means we will also have to compute the position of the sphere in view space, and consequentely the lightDir/halfway vectors so that they can match the rest of the equation.

**Files Modified:**
- `glsl/blinn_phong.vs.glsl`
- `glsl/blinn_phong.fs.glsl`

**Key Code Snippets:**
```glsl
//vertex
uniform vec3 spherePosition;
out vec3 viewPosition;
out vec3 worldPosition;
out vec3 interpolatedNormal;
out vec3 sphereViewPos;

void main() {
    viewPosition = (viewMatrix * modelMatrix * vec4(position, 1.0)).xyz;
    worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    interpolatedNormal = normalize(normalMatrix * normal);
    sphereViewPos = (viewMatrix * vec4(spherePosition, 1.0)).xyz;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
```
```glsl
//fragment
uniform vec3 ambientColor;
uniform float kAmbient;
uniform vec3 diffuseColor;
uniform float kDiffuse;
uniform vec3 specularColor;
uniform float kSpecular;
uniform float shininess;
uniform mat4 modelMatrix;
uniform vec3 spherePosition;

in vec3 interpolatedNormal;
in vec3 viewPosition;
in vec3 worldPosition;
in vec3 sphereViewPos;

void main() {
    vec3 norm = normalize(interpolatedNormal);
    vec3 lightDir = normalize(sphereViewPos-viewPosition);
    vec3 cameraDir = normalize(-viewPosition);
    vec3 halfway = normalize(lightDir + cameraDir);

    float diffuse = max(dot(norm, lightDir),0.0);
    float specular = pow(max(dot(norm,halfway), 0.0), shininess);

    vec3 color = kAmbient * ambientColor + kDiffuse*diffuse*diffuseColor + kSpecular*specular*specularColor;

    gl_FragColor = vec4(color,1.0);
}
```

---

### (b) Scene 2: Toon (25 pts)

**Requirements:**
- Quantize the light intensity into a number of steps
- Use two tones: red for darker areas and yellow for lighter areas
- Draw dark silhouette outlines that do not move with the light

**Implementation:**
I quantized the intensity using a simple equation that takes the continuous 0-1 diffuse values and forces them to fall on one of 4 "layers" aka hard values in between 0-1. I used 4 layers, which means we have to map the 4 possible subranges of 0-1 to 4 distinct points between 0-1. By doing diffuse * layers, we get a value between 0-4 instead of 0-1. Flooring this ensures we get an integer. we take the minimum of this with layers-1.0 in order to clamp the case where diffuse = exactly 1.0. This ensures we always get a value from 0-3. Since the range 0-4 would actually give us 5 integer values to land on (0,1,2,3,4). Dividing this 0-3 integer by 3 will give us a value of either 0, 0.33, 0.66, or 1.0, which is 4 distinct values/layers between 0-1, exactly what we wanted. Now we can use this variable to determine the color mixture of toonColor and toonColor2, giving us only 4 possible colors in the final image. The fresnel is simply equal to the dot product of the view direction and the interpolated normal. The normal tells us which way a surface is facing. Surfaces facing perpendicular to the camera are "edges" from the camera's perspective. The dot product is equal to the cos between the two vectors when they are both unit length, so we simply check if this dot product is below a certain threshold (is it perpendicular, or at least close enough?). If it is, then consider it on the edge and color the fragment black.

**Files Modified:**
- `glsl/toon.vs.glsl`
- `glsl/toon.fs.glsl`

**Key Code Snippets:**
```glsl
//vertex
uniform vec3 spherePosition;

out vec3 interpolatedNormal;
out vec3 lightDirection;
out vec3 viewPosition;
out float fresnel;
out vec3 sphereViewPos;

void main() {
    viewPosition = (viewMatrix * modelMatrix * vec4(position, 1.0)).xyz;
    vec3 viewDirection = normalize(-viewPosition);
    interpolatedNormal = normalize(normalMatrix * normal);
    sphereViewPos = (viewMatrix * vec4(spherePosition, 1.0)).xyz;
    lightDirection = normalize(sphereViewPos-viewPosition);

    fresnel = dot(viewDirection,interpolatedNormal);

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
```

```glsl
//fragment
in vec3 interpolatedNormal;
in vec3 lightDirection;
in vec3 viewPosition;
in float fresnel;

void main() {
    float diffuse = max(dot(interpolatedNormal, lightDirection),0.0);
    
    float layers = 4.0;
    float layer = min(floor(diffuse*layers), layers-1.0) / (layers-1.0);
    vec3 color = mix(toonColor2,toonColor,layer);

    gl_FragColor = vec4(color,1.0);

    if(fresnel<0.35)
        gl_FragColor = vec4(outlineColor,1.0);
}
```

---

### (c) Scene 3: Polka Dots (30 pts)

**Requirements:**
- Give the dragon polka dots on a regular 3D grid (discard the fragments between dots)
- Make the dots smoothly roll down the body over time
- Make the dots smoothly change colour over time

**Implementation:**
I used the exact same approach from the toon shader to break the diffuse range into layers, but this time only used 3 layers instead of 4. To construct the 3D grid, I simply multiplied the vertex position by a constant value, thus scaling up the range of possible points on the dragon. It actually didn't look too bad without scaling, so I only used a factor of 1.5. once we have this scaled point, we can use fract() to only get the fractional portion of it. This would make the point (20.1, 10.5, 20.3) become (.1,.5,.3), aka its position within its "cell." This effectively means that any time an axis of the scaled point crosses an integer boundary, it falls into a new cell. The 1.5 multiplier increases the total number of these integer boundaries that we have along the dragon. If we take the inter-cell position - (0.5,0.5,0.5), we get the vector pointing from the center of the cell to the inter-cell position. If the length of this is greater than our radius value, we discard the fragment. This creates the circles of color. Finally, we shift the y axis of this scaled point by an ever-increasing value to create the effect of sliding dots along the dragon. To create the effect of smoothly shifting colors, I took my original two colors and split them each into their own mixture of two colors. using mixer = 0.5 + 0.5*sin(ticks) with the ever increasing ticks value will give us a function that is constantly going between 0 and 1. So one of our "mixed" colors is composed of mix(color1,color1b,mixer) and the other mix(color2,color2b,mixer). With this, we will always have two distinct colors on the dragon, where one will be shifting back and forth between green and orange, the other between purple and yellow. 

**Files Modified:**
- `glsl/dots.vs.glsl`
- `glsl/dots.fs.glsl`

**Key Code Snippets:**
```glsl
//vertex
uniform vec3 spherePosition;

out vec3 interpolatedNormal;
out vec3 lightDirection;
out vec3 vertexPosition;

void main() {
    vec3 viewPosition = (viewMatrix * modelMatrix * vec4(position, 1.0)).xyz;
    vec3 viewDirection = normalize(-viewPosition);
    interpolatedNormal = normalize(normalMatrix * normal);
    vec3 sphereViewPos = (viewMatrix * vec4(spherePosition, 1.0)).xyz;
    lightDirection = normalize(sphereViewPos-viewPosition);
    vertexPosition = position;
    
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
```

```glsl
//fragment
uniform float ticks;

in vec3 interpolatedNormal;
in vec3 lightDirection;
in vec3 vertexPosition;

vec3 color1 = vec3(1.0,0.5,0.3);
vec3 color1b = vec3(0.0,0.8,0.4);
vec3 color2 = vec3(0.6,0.8,0.2);
vec3 color2b = vec3(0.6,0.5,1.0);

void main() {
    float diffuse = max(dot(interpolatedNormal, lightDirection),0.0);
    
    float mixer = 0.5 + 0.5*sin(ticks);
    vec3 mixColor1 = mix(color1,color1b,mixer);
    vec3 mixColor2 = mix(color2,color2b,mixer);

    float layers = 3.0;
    float layer = min(floor(diffuse*layers), layers-1.0) / (layers-1.0);
    vec3 color = mix(mixColor1,mixColor2,layer);

    float gridSize = 1.5;
    float radius = 0.4;
    vec3 scaledPoint = gridSize * vertexPosition;
    scaledPoint.y -= ticks;

    vec3 cellPos = fract(scaledPoint) - 0.5; //makes 0.5,0.5,0.5 the origin of the cell
    if(length(cellPos) > radius)
        discard;

    gl_FragColor = vec4(color,1.0);
}
```

---

### (d) Scene 4: Three.js PBR and Texturing (20 pts)

**Requirements:**
- Load the helmet's textures in `gltf/` with `THREE.TextureLoader`
- Pass them to `helmetPBRMaterial` and set its metalness, so the helmet looks like Figure 7

**Implementation:**
The albedo goes into the colorMap. It just defines the default color of the surface. The AO becomes the ambient occlusion map, or how much baseline environmental/non-directional light the surface is exposed to. The emissive file goes with the emissive map, controlling the sections of the texture that glow. The emissive color defines the color of that glow. The normal file goes with the normal map, which effect the surface normal of the object, and thus how light reacts to it. As per the assignment instructions, I disabled flipY and enabled RepeatWrapping for each of the maps. Then I also set the color space of the color map and the emissive to SRGB, and the metalness to 1.0.
**Files Modified:**
- `A4.js`

**Key Code Snippets:**
```javascript
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
  map: base,
  aoMap: AO,
  emissiveMap: emissiveMap,
  emissive: emissive,
  roughnessMap: metalRoughness,
  metalnessMap: metalRoughness,
  normalMap: normal,
  metalness: 1.0,
});
```

---

## Part 2: Creative License (Optional - Bonus up to 10 pts)
N/A


## Screenshots
[Include screenshots of your working program showing each part's functionality]
- **Blinn-Phong:** [Screenshot of scene 1]
- **Toon:** [Screenshot of scene 2, with the silhouette outlines visible]
- **Polka Dots:** [Screenshots of scene 3 at two different times, showing the dots rolling and changing colour]
- **PBR:** [Screenshot of scene 4 showing the textured helmet]
