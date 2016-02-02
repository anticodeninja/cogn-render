precision highp float;

attribute vec3 a_vertex;
attribute float a_angle;
attribute vec2 a_position;

uniform float u_thickness;
uniform float u_antialias;
uniform vec2 u_aspect;

varying vec4 v_color;
varying float v_radius;
varying vec2 v_pos;

void main() {
    vec2 transform = vec2(cos(a_angle), sin(a_angle));
    float radius = abs(a_position.x);
    vec2 screen = a_vertex.xy  + (radius + u_thickness + u_antialias) * transform * u_aspect;
    
    v_color = vec4(1.0, 1.0, 1.0, 1.0);
    v_pos = a_position + (u_antialias + u_thickness) * sign(a_position);
    v_radius = radius;
    
    gl_Position = vec4(screen, 1.0 - a_vertex.z, 1.0);
}
