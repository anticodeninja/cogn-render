precision highp float;

varying vec2 v_coord;

uniform sampler2D u_color_texture1;
uniform sampler2D u_depth_texture1;
uniform sampler2D u_color_texture2;
uniform sampler2D u_depth_texture2;

uniform vec4 u_viewport;

void main() {
    vec2 coord = gl_FragCoord.xy / u_viewport.zw;
    
    vec4 color1 = texture2D(u_color_texture1, coord);
    float depth1 = texture2D(u_depth_texture1, coord).x;
    vec4 color2 = texture2D(u_color_texture2, coord);
    float depth2 = texture2D(u_depth_texture2, coord).x;

    if (depth1 == 1.0 && depth2 == 1.0) {
        discard;
    } else if (depth1 == 1.0) {
        gl_FragColor = color2;
    } else if (depth1 < depth2) {
        gl_FragColor = vec4(color1.rgb, 1.0);
    } else {
        gl_FragColor = vec4(color1.rgb * (1.0 - color2.a) + color2.rgb * color2.a, 1.0);
    }
}
