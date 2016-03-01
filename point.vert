precision highp float;

attribute vec3 a_vertex;
attribute float a_angle;
attribute vec2 a_position;
attribute vec4 a_id;

uniform mat4 u_mvp;
uniform float u_thickness;
uniform float u_antialias;
uniform vec2 u_aspect;

varying vec4 v_color;
varying float v_radius;
varying vec2 v_pos;
varying vec4 v_id;

void main() {
    vec2 transform = vec2(cos(a_angle), sin(a_angle));
    float radius = abs(a_position.x);
    vec4 vertex = u_mvp * vec4(a_vertex, 1.0);
    vertex /= vertex.w;
    vec2 screen = vertex.xy + (radius + u_thickness + u_antialias) * transform * u_aspect;
    
    v_color = vec4(1.0, 1.0, 1.0, 1.0);
    v_pos = a_position + (u_antialias + u_thickness) * sign(a_position);
    v_radius = radius;
    v_id = a_id;

    gl_Position = vec4(screen, vertex.z, 1.0);
}
