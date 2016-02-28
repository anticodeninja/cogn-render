function idToColor(id) {
    var i,
        mod,
        temp = vec4.create();

    temp[3] = id != 0 ? 1.0 : 0.0;
    
    for (i=0; i<3; ++i) {
        mod = id % 256;
        id = Math.floor(id / 256);
        temp[i] = mod / 255.0;
    }

    return temp;
}

function colorToId(color) {
    if (color[3] == 0.0)
        return 0;

    return color[0] | color[1] << 8 | color[2] << 16;
}
