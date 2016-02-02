#extension GL_EXT_draw_buffers : require
precision highp float;

uniform float u_step;
uniform float u_antialias;
uniform float u_thickness;
uniform float u_pattern;
uniform float u_space;
uniform float u_period;

varying float v_radius;
varying vec4 v_color;
varying vec2 v_pos;

void main() {
    float length2 = v_pos.x * v_pos.x + v_pos.y * v_pos.y;
    float reduced_radius = v_radius - u_antialias;
    float full_radius = v_radius + u_thickness;
    float max_radius = full_radius + u_antialias;

    if (length2 > max_radius * max_radius) {
        discard;
    }

    gl_FragData[0] = vec4(1.0, 1.0, 1.0, 1.0);
    
    if (length2 > reduced_radius * reduced_radius) {
        gl_FragData[0].rgb *= 1.0 - smoothstep(reduced_radius, v_radius, sqrt(length2));
    }
    
    if (length2 > full_radius * full_radius) {
        gl_FragData[0].a = 1.0 - smoothstep(full_radius, full_radius + u_antialias, sqrt(length2));
    }

    if ((gl_FragData[0].a < 1.0 && u_step == 1.0) || (gl_FragData[0].a == 1.0 && u_step == 2.0)) {
        discard;
    }
}
