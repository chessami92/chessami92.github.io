var canvas;

// Dimensions of current frame
var maxIter;
var equalityLimit;
var width;
var height;
var startReal;
var startI;

// Rendered fractal
var img;
// Image for displaying individual iterations
var cycleImg;
var cycleCtx;

// Variables for tracking individual iterations
var traceR;
var traceI;
var lastTraceR;
var lastTraceI;
var traceCR;
var traceCI;
var traceIter;
var traceMaxIter;
var traceTimeout;
var traceFast;

function setupIter( cR, cI, traceFast ) {
    traceR = 0;
    traceI = 0
    lastTraceR = 0;
    lastTraceI = 0;
    traceIter = 0;
    traceMaxIter = mandelIter( cR, cI, !traceFast );
    traceCR = cR;
    traceCI = cI;
}

// Return true if done iterating
function iterLoop() {
    var rr = 0;
    var ii = 0;
    var ri = 0;

    ri = traceR * traceI;
    rr = traceR * traceR;
    ii = traceI * traceI;
    traceR = rr - ii + traceCR;
    traceI = ri + ri + traceCI;

    traceIter++

    if( traceIter > traceMaxIter ) {
        return true;
    } else {
        return false;
    }
}

function mandelIter( cx, cy, forTrace ) {
    var x = 0.0;
    var y = 0.0;
    var xx = 0;
    var yy = 0;
    var xy = 0;
 
    var i;
    var minDistance = Infinity;
    var cycle = 0;
    var cycleR = cx;
    var cycleI = cy;
    for( i = 0; ( i <= maxIter ) && ( xx + yy <= 4 ); i++ ) {
        xy = x * y;
        xx = x * x;
        yy = y * y;
        x = xx - yy + cx;
        y = xy + xy + cy;

        if( i != 0 ) {
            var distance = Math.abs( x - cx ) + Math.abs( y - cy );
            if( distance < equalityLimit ) {
                if( false == forTrace ) {
                    i = maxIter + 1;
                }
                break;
            } else if( ( distance * 10 ) < minDistance ) {
                // This is significantly closer, this is probably the actual cycle number
                minDistance = distance;
                cycle = i;
            }
        }

        if( ( 0 != cycle ) && ( 0 == ( i % cycle ) ) ) {
            var distance = Math.abs( x - cycleR ) + Math.abs( y - cycleI );
            if( distance < equalityLimit ) {
                if( false == forTrace ) {
                    i = maxIter + 1;
                }
                break;
            } else {
                cycleR = x;
                cycleI = y;
            }
        }
    }
    return i;
}

function mandelbrot(canvas, xmin, xmax, ymin, ymax ) {
    var width = canvas.width;
    var height = canvas.height;
 
    var ctx = canvas.getContext('2d');
    img = ctx.getImageData(0, 0, width, height);
    var pix = img.data;
 
    for (var ix = 0; ix < width; ++ix) {
        for (var iy = 0; iy < height; ++iy) {
            var x = xmin + (xmax - xmin) * ix / (width - 1);
            var y = ymin + (ymax - ymin) * iy / (height - 1);
            var i = mandelIter( x, y, false );
            var ppos = 4 * (width * iy + ix);
 
            if (i > maxIter) {
                pix[ppos] = 0;
                pix[ppos + 1] = 0;
                pix[ppos + 2] = 0;
            } else {
                var c = 3 * Math.log(i) / Math.log(maxIter - 1.0);
 
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
    window.location.href = window.location.href.substr( 0, window.location.href.lastIndexOf( '?' ) ) + "?centerReal=" + centerReal + "&centerI=" + centerI + "&width=" + width;
}

function iterationTrace() {
    if( false == traceFast ) {
        cycleCtx.strokeStyle = "#999999";
        cycleCtx.beginPath();
        cycleCtx.moveTo( getX( lastTraceR ), getY( lastTraceI ) );
        cycleCtx.lineTo( getX( traceR ), getY( traceI ) );
        cycleCtx.stroke();
    }

    lastTraceR = traceR;
    lastTraceI = traceI;
 
    var iterationComplete = iterLoop();

    if( ( false == traceFast ) && ( false == iterationComplete ) ) {
        traceTimeout = setTimeout( iterationTrace, 100 );
    }

    cycleCtx.strokeStyle = "#FFFFFF";
    cycleCtx.beginPath();
    cycleCtx.moveTo( getX( lastTraceR ), getY( lastTraceI ) );
    cycleCtx.lineTo( getX( traceR ), getY( traceI ) );
    cycleCtx.stroke();

    return iterationComplete;
}

function canvasMouseMove() {
    clearTimeout( traceTimeout );

    // Copy off the old image and set up a new context
    var ctx = canvas.getContext( '2d' );
    cycleImg = ctx.createImageData( canvas.width, canvas.height );
    cycleImg.data.set( img.data );
    ctx.putImageData( cycleImg, 0, 0 );
    cycleCtx = canvas.getContext( '2d' );
    cycleCtx.lineWidth = 2;

    setupIter( getReal( event.clientX ), getI( event.clientY ), traceFast );
    if( true == traceFast ) {
        while( false == iterationTrace() ) {
        }
    } else {
        iterationTrace();
    }
}
 
function main() {
    console.log( window.location.href );

    window.addEventListener( 'resize', main );

    canvas = document.getElementById('fractal');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.addEventListener( 'click', canvasClick );

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

    maxIter = 1000 * 2 / Math.pow( endReal - startReal, 1 / 4 );
    equalityLimit = 1 / ( Math.pow( maxIter, 2 ) );

    var date = new Date();
    var startMs = date.getTime();
    mandelbrot( canvas, startReal, endReal, startI, endI );
    var date = new Date();
    console.log( 'Draw took ', date.getTime() - startMs, 'ms' );
}

function handleCycleClick( radio ) {
    if( "fast" == radio.value ) {
        canvas.addEventListener( 'mousemove', canvasMouseMove, false );
        traceFast = true;
    } else if( "slow" == radio.value ) {
        canvas.addEventListener( 'mousemove', canvasMouseMove, false );
        traceFast = false;
    } else { // if ( "none" == radio.value ) {
        canvas.removeEventListener( 'mousemove', canvasMouseMove, false );

        // Restore the old image
        var ctx = canvas.getContext( '2d' );
        ctx.putImageData( img, 0, 0 );
    }
}