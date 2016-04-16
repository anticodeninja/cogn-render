precision highp float;

uniform float u_step;
uniform float u_antialias;
uniform float u_thickness;
uniform float u_pattern;
uniform float u_space;
uniform float u_period;

uniform sampler2D u_depth;
uniform vec2 u_aspect;

varying float v_offset;
varying float v_length;
varying vec2 v_pos;
varying vec4 v_color;

void main() {
    float prevDepth = texture2D(u_depth, (gl_FragCoord.xy * u_aspect / 2.0)).r;
    float modded = mod(v_offset, u_period);
    if (modded > u_pattern) {
        discard;
    }

    gl_FragColor = v_color;

    float length2 = 0.0;
    if (v_pos.x < 0.0) {
        length2 = v_pos.x * v_pos.x + v_pos.y * v_pos.y;
    } else if (v_pos.x > v_length) {
        length2 = (v_pos.x - v_length) * (v_pos.x - v_length) + v_pos.y * v_pos.y;
    }

    float koef_r = 1.0;
    if (length2 > 0.0) {
        float max_radius = u_thickness + u_antialias;

        if (length2 > max_radius * max_radius) {
            discard;
        } else if (length2 > u_thickness * u_thickness) {
            koef_r = 1.0 - smoothstep(u_thickness, max_radius, sqrt(length2));
        }
    }

    float koef_x = 1.0;
    if (modded > u_antialias && modded < (u_pattern - u_antialias)) {
        koef_x = 1.0;
    } else if (modded <= u_antialias) {
        koef_x = smoothstep(0.0, u_antialias, modded);
    } else {
        koef_x = 1.0 - smoothstep(u_pattern - u_antialias, u_pattern, modded);
    }

    float koef_y = 1.0 - smoothstep(u_thickness, u_thickness + u_antialias, abs(v_pos.y));

    gl_FragColor.a *= koef_r * koef_x * koef_y;

    if (u_step == 1.0) {
        if (gl_FragColor.a < 1.0) discard;
    } else if (u_step == 2.0) {
        if (gl_FragColor.a == 1.0) discard;
        if (gl_FragCoord.z >= prevDepth) discard;
    } else if (u_step == 3.0) {
        if (gl_FragColor.a < 1.0) discard;
        discard;
    }
}
