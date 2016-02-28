precision highp float;

uniform float u_step;
uniform float u_antialias;
uniform float u_thickness;
uniform float u_pattern;
uniform float u_space;
uniform float u_period;

varying vec3 v_color;
varying vec2 v_pos;

void main() {
    float modded = mod(v_pos.x, u_period);
    if (modded > u_pattern) {
        discard;
    }

    gl_FragColor = vec4(v_color, 1.0);

    float koef_x = 1.0;
    if (modded > u_antialias && modded < (u_pattern - u_antialias)) {
        koef_x = 1.0;
    } else if (modded <= u_antialias) {
        koef_x = smoothstep(0.0, u_antialias, modded);
    } else {
        koef_x = 1.0 - smoothstep(u_pattern - u_antialias, u_pattern, modded);
    }

    float koef_y = 1.0 - smoothstep(u_thickness, u_thickness + u_antialias, abs(v_pos.y));
        
    gl_FragColor.a = koef_x * koef_y;

    if (u_step == 1.0) {
        if (gl_FragColor.a < 1.0) discard;
    } else if (u_step == 2.0) {
        if (gl_FragColor.a == 1.0) discard;
    } else if (u_step == 3.0) {
        if (gl_FragColor.a < 1.0) discard;
        discard;
    }
}
