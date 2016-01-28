precision highp float;

attribute vec3 a_vertex;
attribute vec4 a_extra4;

uniform mat4 u_mvp;
uniform float u_thickness;
uniform float u_antialias;
uniform vec2 u_aspect;

varying vec4 v_color;
varying vec2 v_pos;

void main() {
    bool upper = a_extra4[0] > 0.0;
    bool right = abs(a_extra4[0]) > 1.68;
    
    v_color = vec4(1.0, 1.0, 1.0, 1.0);
    
    gl_Position = u_mvp * vec4(a_vertex, 1.0);
    gl_Position /= gl_Position.w;

    vec2 transform = vec2(cos(a_extra4[0]), sin(a_extra4[0]));

    gl_Position.xy = gl_Position.xy + 2.0 * (u_thickness + u_antialias) * transform * u_aspect;
    
    v_pos.x = a_extra4[2];
    v_pos.y = a_extra4[3] + 2.0 * u_antialias * sign(a_extra4[3]);
}
