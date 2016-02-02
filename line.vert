precision highp float;

attribute vec3 a_vertex;
attribute float a_angle;
attribute vec2 a_position;

uniform float u_thickness;
uniform float u_antialias;
uniform vec2 u_aspect;

varying vec4 v_color;
varying vec2 v_pos;

void main() {
    vec2 transform = vec2(cos(a_angle), sin(a_angle));
    vec2 screen = a_vertex.xy + (u_thickness + u_antialias) * transform * u_aspect;
    
    v_color = vec4(1.0, 1.0, 1.0, 1.0);
    v_pos = a_position + vec2(0.0, u_antialias * sign(a_position.y));
    
    gl_Position = vec4(screen, 1.0 - a_vertex.z, 1.0);
}
