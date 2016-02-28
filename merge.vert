precision highp float;

attribute vec3 a_vertex;

void main() {
    gl_Position = vec4(a_vertex * 2.0 - 1.0, 1.0);
}
