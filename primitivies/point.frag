precision highp float;

uniform float u_step;
uniform float u_antialias;
uniform float u_thickness;

uniform sampler2D u_opaque;
uniform sampler2D u_prev;
uniform vec2 u_aspect;

varying float v_radius;
varying vec4 v_color;
varying vec4 v_id;
varying vec2 v_pos;

void main() {
    if (u_step >= 2.0) {
        float opaqueDepth = texture2D(u_opaque, (gl_FragCoord.xy * u_aspect / 2.0)).r;
        if (gl_FragCoord.z > opaqueDepth) { discard; return; };
    }
    if (u_step >= 3.0) {
        float prevDepth = texture2D(u_prev, (gl_FragCoord.xy * u_aspect / 2.0)).r;
        if (gl_FragCoord.z <= prevDepth) { discard; return; };
    }

    float full_radius = v_radius + u_thickness;
    float max_radius = full_radius + u_antialias;
    float length2 = v_pos.x * v_pos.x + v_pos.y * v_pos.y;

    if (length2 > max_radius * max_radius) { discard; return; }

    if (u_step == 0.0) {
        gl_FragColor = v_id;
    } else {
        gl_FragColor = v_color;

        if (length2 > full_radius * full_radius) {
            gl_FragColor.a *= 1.0 - smoothstep(full_radius, max_radius, sqrt(length2));
        }

        if (u_step == 1.0) {
            if (gl_FragColor.a < 1.0) { discard; return; }
        } else if (u_step >= 2.0) {
            if (gl_FragColor.a == 1.0) { discard; return; }
        }

        float reduced_radius = v_radius - u_antialias;
        if (length2 > reduced_radius * reduced_radius) {
            gl_FragColor.rgb *= 1.0 - smoothstep(reduced_radius, v_radius, sqrt(length2));
        }
    }
}
