precision highp float;
uniform vec4 u_color;
varying vec4 v_color;

void main() {
     gl_FragColor = u_color * v_color;
}