# CS 4361 Assignment 4: Shaders

**Student Name:** [Your Name]  
**Student Number:** [Your Student Number]  
**NetID:** [Your NetID]  

## Assignment Overview

This assignment implements several shading algorithms in GLSL and Three.js: Blinn-Phong reflection and toon shading on the dragon, animated polka dots, and physically based rendering (PBR) of a textured helmet with `MeshStandardMaterial`.

## Part 1: Required Features (100 pts)

### (a) Scene 1: Blinn-Phong Reflection (25 pts)

**Requirements:**
- Pass the needed values (position, normal, view position) from the vertex shader to the fragment shader
- Compute the ambient, diffuse and specular terms per fragment and sum them, as in Figure 3

**Implementation:**
[Explain which frame each vector is in and how you computed the three terms]

**Files Modified:**
- `glsl/blinn_phong.vs.glsl`
- `glsl/blinn_phong.fs.glsl`

**Key Code Snippets:**
```glsl
// Add your vertex shader code here
```
```glsl
// Add your fragment shader code here
```

---

### (b) Scene 2: Toon (25 pts)

**Requirements:**
- Quantize the light intensity into a number of steps
- Use two tones: red for darker areas and yellow for lighter areas
- Draw dark silhouette outlines that do not move with the light

**Implementation:**
[Explain how you quantized the intensity, blended the two tones, and detected the silhouette]

**Files Modified:**
- `glsl/toon.vs.glsl`
- `glsl/toon.fs.glsl`

**Key Code Snippets:**
```glsl
// Add your toon shading and outline code here
```

---

### (c) Scene 3: Polka Dots (30 pts)

**Requirements:**
- Give the dragon polka dots on a regular 3D grid (discard the fragments between dots)
- Make the dots smoothly roll down the body over time
- Make the dots smoothly change colour over time

**Implementation:**
[Explain how you built the grid, discarded fragments, and animated the dots and their colour with `ticks`]

**Files Modified:**
- `glsl/dots.vs.glsl`
- `glsl/dots.fs.glsl`

**Key Code Snippets:**
```glsl
// Add your polka dot code here
```

---

### (d) Scene 4: Three.js PBR and Texturing (20 pts)

**Requirements:**
- Load the helmet's textures in `gltf/` with `THREE.TextureLoader`
- Pass them to `helmetPBRMaterial` and set its metalness, so the helmet looks like Figure 7

**Implementation:**
[Explain which texture goes into which material property, and any texture settings you needed]

**Files Modified:**
- `A4.js`

**Key Code Snippets:**
```javascript
// Add your texture loading and material code here
```

---

## Part 2: Creative License (Optional - Bonus up to 10 pts)
[If you completed Part 2, describe your creative extensions here]
**Creative Features Implemented:**
- [Feature 1]: [Description]
- [Feature 2]: [Description]
- [etc.]

**Files Modified:**
- [List files you modified for creative features]


## Screenshots
[Include screenshots of your working program showing each part's functionality]
- **Blinn-Phong:** [Screenshot of scene 1]
- **Toon:** [Screenshot of scene 2, with the silhouette outlines visible]
- **Polka Dots:** [Screenshots of scene 3 at two different times, showing the dots rolling and changing colour]
- **PBR:** [Screenshot of scene 4 showing the textured helmet]
