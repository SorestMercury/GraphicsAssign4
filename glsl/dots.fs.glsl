// HINT: Don't forget to define the uniforms here after you pass them in in A4.js

uniform float ticks;

// The value of our shared variable is given as the interpolation between normals computed in the vertex shader
// below we can see the shared variable we passed from the vertex shader using the 'in' classifier
in vec3 interpolatedNormal;
in vec3 lightDirection;
in vec3 vertexPosition;

void main() {
    // TODO:
    // HINT: First, as you've already done in the Toon fragment shader, compute the light
    // intensity of the current fragment by determining the cosine angle between the surface
    // normal and the light vector. Next, pick any two colors, blend them based on light
    // intensity to give the 3D model some color and depth. Also make the color change wrt ticks.
    // Next, implement rolling dots using the mod function, ticks and discard.

    // HINT: Set final rendered colour
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
