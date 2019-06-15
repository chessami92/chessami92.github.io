// Dimensions of current frame
var width;
var height;
var startReal;
var startI;

// Rendered fractal
var img;
// Image for displaying individual iterations
var cycleImg;
var cycleCtx;

function mandelIter(cx, cy, maxIter, callback ) {
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
        if( callback ) {
            callback( x, y );
        }
    }
    return maxIter - i;
}
 
function mandelbrot(canvas, xmin, xmax, ymin, ymax, iterations) {
    var width = canvas.width;
    var height = canvas.height;
 
    var ctx = canvas.getContext('2d');
    img = ctx.getImageData(0, 0, width, height);
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

function getReal( clientX ) {
    return startReal + width * ( clientX / window.innerWidth );
}

function getI( clientY ) {
    return startI + height * ( clientY / window.innerHeight );
}

function getX( real ) {
    return ( real - startReal ) / width * window.innerWidth;
}

function getY( i ) {
    return ( i - startI ) / height * window.innerHeight;
}

function canvasClick() {
    var centerReal = getReal( event.clientX );
    var centerI = getI( event.clientY );
    width /= 2;
    window.location.href = "fractal.html?centerReal=" + centerReal + "&centerI=" + centerI + "&width=" + width;
}

// var lastReal;
// var lastI;

function iterationTraceCallback( real, i ) {
    // var magnitude = ( real ** 2 + i ** 2 ) ** 0.5;
    // var distance = ( ( real - lastReal ) ** 2 + ( i - lastI ) ** 2 ) ** 0.5;
    // console.log( 'real: ' + real + ' i: ' + i + ' magnitude: ' + magnitude + ' distance: ' + distance );

    cycleCtx.lineTo( getX( real ), getY( i ) );

    // lastReal = real;
    // lastI = i;
}

function canvasMouseMove() {
    var canvas = document.getElementById('fractal');
    canvas.removeEventListener( 'mousemove', canvasMouseMove, false );

    // Copy off the old image and set up a new context
    var ctx = canvas.getContext( '2d' );
    cycleImg = ctx.createImageData( canvas.width, canvas.height );
    cycleImg.data.set( img.data );
    ctx.putImageData( cycleImg, 0, 0 );
    cycleCtx = canvas.getContext( '2d' );
    cycleCtx.lineWidth = 2;
    ctx.strokeStyle = "#FFFFFF";
    cycleCtx.beginPath();
    cycleCtx.moveTo( getX( 0 ), getY( 0 ) );

    var centerReal = getReal( event.clientX );
    var centerI = getI( event.clientY );
    lastReal = 0;
    lastI = 0;
    mandelIter( centerReal, centerI, 1000, iterationTraceCallback );

    cycleCtx.stroke();

    canvas.addEventListener( 'mousemove', canvasMouseMove, false );
}
 
function main() {
    var canvas = document.getElementById('fractal');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.addEventListener( 'click', canvasClick );
    canvas.addEventListener( 'mousemove', canvasMouseMove, false );

    var queryDict = {}
    location.search.substr( 1 ).split( "&" ).forEach( function( item ) {queryDict[item.split( "=" )[0]] = item.split( "=" )[1]} )

    var centerReal = parseFloat( queryDict["centerReal"] );
    var centerI = parseFloat( queryDict["centerI"] );
    width = parseFloat( queryDict["width"] );
    if( !centerReal ) {
        centerReal = -0.5;
    }
    if( !centerI ) {
        centerI = 0;
    }
    if( !width ) {
        // At least show -2 to 1 on real, -1 to 1 on imaginary
        width = 3;
        height = width * window.innerHeight / window.innerWidth;
        if( height < 2 ) {
            var scale = 2 / height;
            height = 2;
            width *= scale;
        }
    }
    height = width * window.innerHeight / window.innerWidth;

    startReal = centerReal - width / 2;
    var endReal = centerReal + width / 2;
    startI = centerI - height / 2;
    var endI = centerI + height / 2;

    var date = new Date();
    var startMs = date.getTime();
    mandelbrot( canvas, startReal, endReal, startI, endI, 1000 );
    var date = new Date();
    console.log( 'Draw took ', date.getTime() - startMs, 'ms' );
}