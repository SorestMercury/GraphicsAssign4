// HINT: Don't forget to define the uniforms here after you pass them in in A4.js

uniform float ticks;

// The value of our shared variable is given as the interpolation between normals computed in the vertex shader
// below we can see the shared variable we passed from the vertex shader using the 'in' classifier
in vec3 interpolatedNormal;
in vec3 lightDirection;
in vec3 vertexPosition;

vec3 color1 = vec3(1.0,0.5,0.3);
vec3 color1b = vec3(0.0,0.8,0.4);
vec3 color2 = vec3(0.6,0.8,0.2);
vec3 color2b = vec3(0.6,0.5,1.0);

void main() {
    // TODO:
    // HINT: First, as you've already done in the Toon fragment shader, compute the light
    // intensity of the current fragment by determining the cosine angle between the surface
    // normal and the light vector. Next, pick any two colors, blend them based on light
    // intensity to give the 3D model some color and depth. Also make the color change wrt ticks.
    // Next, implement rolling dots using the mod function, ticks and discard.
    float diffuse = max(dot(interpolatedNormal, lightDirection),0.0);
    
    float mixer = 0.5 + 0.5*sin(ticks);
    vec3 mixColor1 = mix(color1,color1b,mixer);
    vec3 mixColor2 = mix(color2,color2b,mixer);

    float layers = 4.0;
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
