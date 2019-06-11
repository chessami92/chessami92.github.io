function mandelIter(cx, cy, maxIter) {
    var x = 0.0;
    var y = 0.0;
    var xx = 0;
    var yy = 0;
    var xy = 0;
 
    var i = maxIter;
    while (i-- && xx + yy <= 4) {
        xy = x * y;
        xx = x * x;
        yy = y * y;
        x = xx - yy + cx;
        y = xy + xy + cy;
    }
    return maxIter - i;
}
 
function mandelbrot(canvas, xmin, xmax, ymin, ymax, iterations) {
    var width = canvas.width;
    var height = canvas.height;
 
    var ctx = canvas.getContext('2d');
    var img = ctx.getImageData(0, 0, width, height);
    var pix = img.data;
 
    for (var ix = 0; ix < width; ++ix) {
        for (var iy = 0; iy < height; ++iy) {
            var x = xmin + (xmax - xmin) * ix / (width - 1);
            var y = ymin + (ymax - ymin) * iy / (height - 1);
            var i = mandelIter(x, y, iterations);
            var ppos = 4 * (width * iy + ix);
 
            if (i > iterations) {
                pix[ppos] = 0;
                pix[ppos + 1] = 0;
                pix[ppos + 2] = 0;
            } else {
                var c = 3 * Math.log(i) / Math.log(iterations - 1.0);
 
                if (c < 1) {
                    pix[ppos] = 255 * c;
                    pix[ppos + 1] = 0;
                    pix[ppos + 2] = 0;
                }
                else if ( c < 2 ) {
                    pix[ppos] = 255;
                    pix[ppos + 1] = 255 * (c - 1);
                    pix[ppos + 2] = 0;
                } else {
                    pix[ppos] = 255;
                    pix[ppos + 1] = 255;
                    pix[ppos + 2] = 255 * (c - 2);
                }
            }
            pix[ppos + 3] = 255;
        }
    }
 
    ctx.putImageData(img, 0, 0);
}
 
function drawFractal() {
    var canvas = document.getElementById('fractal');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var queryDict = {}
    location.search.substr( 1 ).split( "&" ).forEach( function( item ) {queryDict[item.split( "=" )[0]] = item.split( "=" )[1]} )

    var centerReal = queryDict["centerReal"];
    var centerI = queryDict["centerI"];
    var width = queryDict["width"];
    if( !centerReal ) {
        centerReal = -0.5;
    }
    if( !centerI ) {
        centerI = 0;
    }
    if( !width ) {
        // At least show -2 to 1 on real, -1 to 1 on imaginary
        width = 3;
        var height = width * window.innerHeight / window.innerWidth;
        if( height < 2 ) {
            var scale = 2 / height;
            height = 2;
            width *= scale;
        }
    }
    var height = width * window.innerHeight / window.innerWidth;

    var startReal = centerReal - width / 2;
    var endReal = centerReal + width / 2;
    var startI = centerI - height / 2;
    var endI = centerI + height / 2;

    var date = new Date();
    var startMs = date.getTime();
    mandelbrot( canvas, startReal, endReal, startI, endI, 1000 );
    var date = new Date();
    console.log( 'Draw took ', date.getTime() - startMs, 'ms' );
}