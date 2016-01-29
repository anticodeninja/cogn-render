precision highp float;

attribute vec3 a_vertex;
attribute float a_angle;
attribute vec2 a_pos;

uniform mat4 u_mvp;
uniform float u_thickness;
uniform float u_antialias;
uniform vec2 u_aspect;

varying vec4 v_color;
varying vec2 v_pos;

void main() {
    v_color = vec4(1.0, 1.0, 1.0, 1.0);
    
    gl_Position = u_mvp * vec4(a_vertex, 1.0);
    gl_Position /= gl_Position.w;

    vec2 transform = vec2(cos(a_angle), sin(a_angle));

    gl_Position.xy = gl_Position.xy + (u_thickness + u_antialias) * transform * u_aspect;
    
    v_pos.x = a_pos.x;
    v_pos.y = a_pos.y + u_antialias * sign(a_pos.y);
}
