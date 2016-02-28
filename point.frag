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
varying vec4 v_id;

void main() {
    float length2 = v_pos.x * v_pos.x + v_pos.y * v_pos.y;
    float reduced_radius = v_radius - u_antialias;
    float full_radius = v_radius + u_thickness;
    float max_radius = full_radius + u_antialias;

    if (length2 > max_radius * max_radius) {
        discard;
    }

    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

    if (length2 > full_radius * full_radius) {
        gl_FragColor.a = 1.0 - smoothstep(full_radius, full_radius + u_antialias, sqrt(length2));
    }

    if (u_step == 1.0) {
        if (gl_FragColor.a < 1.0) discard;
    } else if (u_step == 2.0) {
        if (gl_FragColor.a == 1.0) discard;
    } else if (u_step == 3.0) {
        if (gl_FragColor.a < 1.0) discard;
        gl_FragColor = v_id;
        return;
    }
    
    if (length2 > reduced_radius * reduced_radius) {
        gl_FragColor.rgb *= 1.0 - smoothstep(reduced_radius, v_radius, sqrt(length2));
    }
}
