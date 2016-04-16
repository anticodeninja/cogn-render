precision highp float;

attribute vec3 a_vertex;
attribute float a_angle;
attribute float a_length;
attribute float a_offset;
attribute vec2 a_position;

uniform vec4 u_color;
uniform float u_thickness;
uniform float u_antialias;
uniform vec2 u_aspect;

uniform mat4 u_mvp;
uniform float u_far;

varying float v_length;
varying float v_offset;
varying vec2 v_pos;
varying vec4 v_color;

void main() {
    vec2 transform = vec2(cos(a_angle), sin(a_angle));
    vec4 vertex = u_mvp * vec4(a_vertex, 1.0);
    vertex.xy /= vertex.w;
    vec2 screen = vertex.xy + (u_thickness + u_antialias) * transform * u_aspect;

    v_length = a_length;
    v_pos = a_position + vec2((u_thickness + u_antialias) * (a_position.x > 0.0 ? 1.0 : -1.0), u_antialias * sign(a_position.y));
    v_offset = a_offset;
    v_color = u_color;

    gl_Position = vec4(screen, vertex.z / u_far, 1.0);
}
