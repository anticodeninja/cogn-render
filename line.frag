#extension GL_EXT_draw_buffers : require
precision highp float;

uniform float u_step;
uniform float u_antialias;
uniform float u_thickness;
uniform float u_pattern;
uniform float u_space;
uniform float u_period;

varying vec4 v_color;
varying vec2 v_pos;

void main() {
    float modded = mod(v_pos.x, u_period);
    if (modded > u_pattern) {
        discard;
    }

    gl_FragData[0] = v_color;
    //gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    //gl_FragColor.r = abs(v_pos.y) < u_thickness ? 1.0 : 0.0;

    float koef_x = 1.0;
    if (modded > u_antialias && modded < (u_pattern - u_antialias)) {
        koef_x = 1.0;
        //gl_FragColor.g = 1.0;
    } else if (modded <= u_antialias) {
        koef_x = smoothstep(0.0, u_antialias, modded);
        //gl_FragColor.g = 0.5;
    } else {
        koef_x = 1.0 - smoothstep(u_pattern - u_antialias, u_pattern, modded);
        //gl_FragColor.g = 0.5;
    }

    float koef_y = 1.0 - smoothstep(u_thickness, u_thickness + u_antialias, abs(v_pos.y));
        
    gl_FragData[0].a *= koef_x * koef_y;

    if ((gl_FragData[0].a < 1.0 && u_step == 1.0) || (gl_FragData[0].a == 1.0 && u_step == 2.0)) {
        discard;
    }
}
