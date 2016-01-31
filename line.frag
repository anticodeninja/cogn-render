precision highp float;

uniform float u_antialias;
uniform float u_thickness;
uniform float u_pattern;
uniform float u_space;
uniform float u_period;

varying vec4 v_color;
varying vec2 v_pos;

void main() {
    float koef_x = 1.0;
    float koef_y = 1.0 - smoothstep(u_thickness, u_thickness + u_antialias, abs(v_pos.y));

    gl_FragColor = v_color;
    //gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    //gl_FragColor.r = abs(v_pos.y) < u_thickness ? 1.0 : 0.0;

    float modded = mod(v_pos.x, u_period);
    if (modded > u_antialias && modded < (u_pattern - u_antialias)) {
        koef_x = 1.0;
        //gl_FragColor.g = 1.0;
    } else if (modded > u_pattern) {
        koef_x = 0.0;
        //gl_FragColor.g = 0.0;
    } else if (modded <= u_antialias) {
        koef_x = smoothstep(0.0, u_antialias, modded);
        //gl_FragColor.g = 0.5;
    } else {
        koef_x = 1.0 - smoothstep(u_pattern - u_antialias, u_pattern, modded);
        //gl_FragColor.g = 0.5;
    }
    float koef = koef_y * koef_x;
    
    gl_FragColor.a *= koef;
}
