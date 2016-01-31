precision highp float;

uniform float u_antialias;
uniform float u_thickness;
uniform float u_pattern;
uniform float u_space;
uniform float u_period;

varying float v_radius;
varying vec4 v_color;
varying vec2 v_pos;

void main() {
    // float koef_y = 1.0 - smoothstep(u_thickness, u_thickness + u_antialias, abs(v_pos.y));
    float length2 = v_pos.x * v_pos.x + v_pos.y * v_pos.y;
    float reduced_radius = v_radius - u_antialias;
    float full_radius = v_radius + u_thickness;
    
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

    if (length2 > reduced_radius * reduced_radius) {
        gl_FragColor.rgb *= 1.0 - smoothstep(reduced_radius, v_radius, sqrt(length2));
    }
    
    if (length2 > full_radius * full_radius) {
        gl_FragColor.a = 1.0 - smoothstep(full_radius, full_radius + u_antialias, sqrt(length2));
    }
}
