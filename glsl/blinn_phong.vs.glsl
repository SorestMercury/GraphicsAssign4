uniform vec3 spherePosition;

// A shared variable is initialized in the vertex shader and attached to the current vertex being processed,
// such that each vertex is given a shared variable and when passed to the fragment shader,
// these values are interpolated between vertices and across fragments,
// below we can see the shared variable is initialized in the vertex shader using the 'out' classifier
out vec3 viewPosition;
out vec3 worldPosition;
out vec3 interpolatedNormal;
out vec3 sphereViewPos;

void main() {
    
    // TODO: compute the out variables declared above. Think about which frame(s) each
    // variable should be defined with respect to
    viewPosition = (viewMatrix * modelMatrix * vec4(position, 1.0)).xyz;
    worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    interpolatedNormal = normalize(normalMatrix * normal);
    sphereViewPos = (viewMatrix * vec4(spherePosition, 1.0)).xyz;


    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
