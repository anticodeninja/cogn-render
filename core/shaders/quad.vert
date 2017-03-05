precision highp float;

attribute vec3 a_vertex;
attribute vec2 a_coord;
varying vec2 v_coord;
uniform vec2 u_position;
uniform vec2 u_size;
uniform vec2 u_viewport;
uniform mat3 u_transform;

void main() {
    v_coord = a_coord;
        
    vec3 pos = vec3(u_position + vec2(a_vertex.x, 1.0 - a_vertex.y) * u_size, 1.0);
    pos = u_transform * pos;
    
    //normalize
    pos.x = (2.0 * pos.x / u_viewport.x) - 1.0;
    pos.y = -((2.0 * pos.y / u_viewport.y) - 1.0);
    pos.z = 0.0;
    
    gl_Position = vec4(pos, 1.0);
}
