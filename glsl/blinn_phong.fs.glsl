
uniform vec3 ambientColor;
uniform float kAmbient;

uniform vec3 diffuseColor;
uniform float kDiffuse;

uniform vec3 specularColor;
uniform float kSpecular;
uniform float shininess;

uniform mat4 modelMatrix;

uniform vec3 spherePosition;

// The value of our shared variable is given as the interpolation between normals computed in the vertex shader
// below we can see the shared variable we passed from the vertex shader using the 'in' classifier
in vec3 interpolatedNormal;
in vec3 viewPosition;
in vec3 worldPosition;
in vec3 sphereViewPos;


void main() {
    // TODO:
    // HINT: compute the following - light direction, ambient + diffuse + specular component,
    // then set the final color as a combination of these components
    vec3 norm = normalize(interpolatedNormal);
    vec3 lightDir = normalize(sphereViewPos-viewPosition);
    vec3 cameraDir = normalize(-viewPosition);
    vec3 halfway = normalize(lightDir + cameraDir);

    float diffuse = max(dot(norm, lightDir),0.0);
    float specular = pow(max(dot(norm,halfway), 0.0), shininess);

    vec3 color = kAmbient * ambientColor + kDiffuse*diffuse*diffuseColor + kSpecular*specular*specularColor;
    //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

    gl_FragColor = vec4(color,1.0);
}
