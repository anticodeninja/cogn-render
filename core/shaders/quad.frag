precision highp float;

uniform sampler2D u_texture;
uniform vec4 u_color;
varying vec2 v_coord;

void main() {
    gl_FragColor = u_color * texture2D(u_texture, v_coord);
}
