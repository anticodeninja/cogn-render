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

function colorToArray(color) {
    var res = new Float32Array(4);

    res[0] = parseInt(color.substr(1, 2), 16) / 255;
    res[1] = parseInt(color.substr(3, 2), 16) / 255;
    res[2] = parseInt(color.substr(5, 2), 16) / 255;
    res[3] = color.length > 7
        ? parseInt(color.substring(7, 2), 16) / 255
        : 1.0;

    return res;
}

module.exports.idToColor = idToColor;
module.exports.colorToId = colorToId;
module.exports.colorToArray = colorToArray;
module.exports.SimplexTransformation = require("./simplex-transformation.js")
