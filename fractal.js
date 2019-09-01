var canvas;

// Dimensions of current frame
var maxIter;
var equalityLimit;
var width;
var height;
var startReal;
var startI;
var centerJ;
var centerK;

// Radio options
var cycleType;
var previewType;

// Rendered fractal
var img;
// Image for displaying individual iterations
var cycleImg;
var cycleCtx;

// Variables for tracking individual iterations
var traceR;
var traceI;
var traceJ;
var traceK;
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
    traceJ = 0
    traceK = 0
    lastTraceR = 0;
    lastTraceI = 0;
    traceIter = 0;
    traceMaxIter = mandelIter( cR, cI, centerJ, centerK, null, null, !traceFast );
    traceCR = cR;
    traceCI = cI;
}

// Return true if done iterating
function iterLoop() {
    var rr = traceR * traceR;
    var ii = traceI * traceI;
    var jj = traceJ * traceJ;
    var kk = traceK * traceK;
    var ri = traceR * traceI;
    var rj = traceR * traceJ;
    var rk = traceR * traceK;

    traceR = rr - ii - jj - kk + traceCR;
    traceI = 2 * ri + traceCI;
    traceJ = 2 * rj + centerJ;
    traceK = 2 * rk + centerK;

    traceIter++

    if( traceIter > traceMaxIter ) {
        return true;
    } else {
        return false;
    }
}

function mandelIter( cr, ci, cj, ck, juliaR, juliaI, forTrace ) {
    var r = 0.0;
    var i = 0.0;
    var j = 0.0;
    var k = 0.0;

    var rr = 0.0;
    var ii = 0.0;
    var jj = 0.0;
    var kk = 0.0;
 
    var iter;
    var minDistance = Infinity;
    var cycle = 0;
    var cycleR = cr;
    var cycleI = ci;

    var adderR;
    var adderI;
    var adderJ;
    var adderK;
    if( juliaR && juliaI ) {
        adderR = juliaR;
        adderI = juliaI;
        adderJ = cj;
        adderK = ck;
        r = cr;
        i = ci;
    } else {
        adderR = cr;
        adderI = ci;
        adderJ = cj;
        adderK = ck;
    }
    for( iter = 0; ( iter <= maxIter ) && ( rr + ii + jj + kk <= 4 ); iter++ ) {
        rr = r * r;
        ii = i * i;
        jj = j * j;
        kk = k * k;
        var ri = r * i;
        var rj = r * j;
        var rk = r * k;

        r = rr - ii - jj - kk + adderR;
        i = 2 * ri + adderI;
        j = 2 * rj + adderJ;
        k = 2 * rk + adderK;

        if( iter != 0 ) {
            var distance = Math.abs( r - cr ) + Math.abs( i - ci );
            if( distance < equalityLimit ) {
                if( false == forTrace ) {
                    iter = maxIter + 1;
                }
                break;
            } else if( ( distance * 10 ) < minDistance ) {
                // This is significantly closer, this is probably the actual cycle number
                minDistance = distance;
                cycle = iter;
            }
        }

        if( ( 0 != cycle ) && ( 0 == ( iter % cycle ) ) ) {
            var distance = Math.abs( r - cycleR ) + Math.abs( i - cycleI );
            if( distance < equalityLimit ) {
                if( false == forTrace ) {
                    iter = maxIter + 1;
                }
                break;
            } else {
                cycleR = r;
                cycleI = i;
            }
        }
    }
    return iter;
}

function mandelbrot(canvas, saveImg, xmin, xmax, ymin, ymax, cj, ck, juliaR, juliaI ) {
    var width = canvas.width;
    var height = canvas.height;
 
    var ctx = canvas.getContext('2d');
    var canvasImg = ctx.getImageData(0, 0, width, height);
    var pix = canvasImg.data;
 
    for (var ix = 0; ix < width; ++ix) {
        for (var iy = 0; iy < height; ++iy) {
            var x = xmin + (xmax - xmin) * ix / (width - 1);
            var y = ymin + (ymax - ymin) * iy / (height - 1);
            var i = mandelIter( x, y, cj, ck, juliaR, juliaI, false );
            var ppos = 4 * (width * iy + ix);
 
            if (i > maxIter) {
                pix[ppos] = 0;
                pix[ppos + 1] = 0;
                pix[ppos + 2] = 0;
            } else {
                var c = 3 * Math.log(i) / Math.log(maxIter - 1.0);
 
                if (c < 1) {
                    pix[ppos + 2] = 255 * c;
                    pix[ppos + 1] = 0;
                    pix[ppos + 0] = 0;
                }
                else if ( c < 2 ) {
                    pix[ppos + 2] = 255;
                    pix[ppos + 1] = 255 * (c - 1);
                    pix[ppos + 0] = 0;
                } else {
                    pix[ppos + 2] = 255;
                    pix[ppos + 1] = 255;
                    pix[ppos + 0] = 255 * (c - 2);
                }
            }
            pix[ppos + 3] = 255;
        }
    }
 
    ctx.putImageData( canvasImg, 0, 0 );
    if( saveImg ) {
        img = canvasImg;
    }
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

function loadPage( centerReal, centerI ) {
    window.location.href = window.location.href.substr( 0, window.location.href.lastIndexOf( '?' ) ) +
        "?centerReal=" + centerReal +
        "&centerI=" + centerI +
        "&centerJ=" + centerJ +
        "&centerK=" + centerK +
        "&width=" + width +
        "&cycle=" + cycleType +
        "&preview=" + previewType ;

}

function canvasClick() {
    var centerReal = getReal( event.clientX );
    var centerI = getI( event.clientY );
    width /= 2;
    loadPage( centerReal, centerI );
}

function iterationTrace() {
    cycleCtx.strokeStyle = "#FF8C00";

    if( false == traceFast ) {
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

    if( false == traceFast ) {
        cycleCtx.strokeStyle = "#FFFFFF";
    }
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

function previewZoomMouseMove() {
    var centerReal = getReal( event.clientX );
    var centerI = getI( event.clientY );
    var zoomWidth = width / 32;
    var zoomHeight = zoomWidth * window.innerHeight / window.innerWidth;
    var rMin = centerReal - zoomWidth / 2;
    var rMax = centerReal + zoomWidth / 2;
    var iMin = centerI - zoomHeight / 2;
    var iMax = centerI + zoomHeight / 2;

    var fractalPreview = document.getElementById( 'fractalPreview' );

    mandelbrot( fractalPreview, false, rMin, rMax, iMin, iMax, centerJ, centerK, null, null );
}

function previewJuliaMouseMove() {
    var centerReal = getReal( event.clientX );
    var centerI = getI( event.clientY );

    var zoomHeight = 2;
    var zoomWidth = zoomHeight * window.innerWidth / window.innerHeight;
    var rMin = 0 - zoomWidth / 2;
    var rMax = 0 + zoomWidth / 2;
    var iMin = 0 - zoomHeight / 2;
    var iMax = 0 + zoomHeight / 2;

    var fractalPreview = document.getElementById( 'fractalPreview' );

    mandelbrot( fractalPreview, false, rMin, rMax, iMin, iMax, centerJ, centerK, centerReal, centerI );
}

function previewJuliaZoomedMouseMove() {
    var centerReal = getReal( event.clientX );
    var centerI = getI( event.clientY );

    var zoomWidth = width / 8;
    var zoomHeight = zoomWidth * window.innerHeight / window.innerWidth;
    var rMin = centerReal - zoomWidth / 2;
    var rMax = centerReal + zoomWidth / 2;
    var iMin = centerI - zoomHeight / 2;
    var iMax = centerI + zoomHeight / 2;

    var fractalPreview = document.getElementById( 'fractalPreview' );

    mandelbrot( fractalPreview, false, rMin, rMax, iMin, iMax, centerJ, centerK, centerReal, centerI );
}
 
function main() {
    window.addEventListener( 'resize', main );

    canvas = document.getElementById('fractal');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.addEventListener( 'click', canvasClick );

    var queryDict = {}
    location.search.substr( 1 ).split( "&" ).forEach( function( item ) {queryDict[item.split( "=" )[0]] = item.split( "=" )[1]} )

    var centerReal = parseFloat( queryDict["centerReal"] );
    var centerI = parseFloat( queryDict["centerI"] );
    centerJ = parseFloat( queryDict["centerJ"] );
    centerK = parseFloat( queryDict["centerK"] );
    width = parseFloat( queryDict["width"] );
    if( !centerReal ) {
        centerReal = -0.5;
    }
    if( !centerI ) {
        centerI = 0;
    }
    if( !centerJ ) {
        centerJ = 0;
    }
    if( !centerK ) {
        centerK = 0;
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
    mandelbrot( canvas, true, startReal, endReal, startI, endI, centerJ, centerK, null, null );
    var date = new Date();
    console.log( 'Draw took ', date.getTime() - startMs, 'ms' );

    setCycleType( queryDict['cycle'] );
    setPreviewType( queryDict['preview'] );
    document.getElementById( 'j' ).value = centerJ;
    document.getElementById( 'k' ).value = centerK;
}

function getChecked( groupName ) {
    var radios = document.getElementsByName( groupName );
    for( i = 0; i < radios.length; i++ ) {
        if( radios[i].checked ) {
            return radios[i];
        }
    }
    return null;
}

function setChecked( groupName, value ) {
    var radios = document.getElementsByName( groupName );
    for( i = 0; i < radios.length; i++ ) {
        if( value == radios[i].value ) {
            radios[i].checked = true;
            return radios[i];
        }
    }
}

function setCycleType( urlCycleType ) {
    if( urlCycleType ) {
        var radio = setChecked( 'cycle', urlCycleType );
        handleCycleClick( radio );
    } else {
        handleCycleClick( getChecked( 'cycle' ) );
    }
}

function handleCycleClick( radio ) {
    cycleType = radio.value;

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

function setPreviewType( urlPreviewType ) {
    if( urlPreviewType ) {
        var radio = setChecked( 'preview', urlPreviewType );
        handlePreviewClick( radio );
    } else {
        handlePreviewClick( getChecked( 'preview' ) );
    }
}

function showPreview() {
    var fractalPreview = document.getElementById( 'fractalPreview' );
    fractalPreview.style.display = 'block';
}

function handlePreviewClick( radio ) {
    previewType = radio.value;

    canvas.removeEventListener( 'mousemove', previewZoomMouseMove, false );
    canvas.removeEventListener( 'mousemove', previewJuliaMouseMove, false );
    canvas.removeEventListener( 'mousemove', previewJuliaZoomedMouseMove, false );

    if( "zoom" == radio.value ) {
        canvas.addEventListener( 'mousemove', previewZoomMouseMove, false );
    } else if( "julia" == radio.value ) {
        canvas.addEventListener( 'mousemove', previewJuliaMouseMove, false );
    } else if( "juliaZoom" == radio.value ) {
        canvas.addEventListener( 'mousemove', previewJuliaZoomedMouseMove, false );
    } else { // if ( "none" == radio.value ) {
        fractalPreview.style.display = 'none';
    }

    showPreview();
}

function handleSliderInput( slider ) {
    var val = parseFloat( slider.value );
    var cj, ck;
    if( 'j' == slider.id ) {
        cj = val;
        ck = centerK;
    } else {
        cj = centerJ;
        ck = val;
    }

    showPreview();
    var fractalPreview = document.getElementById( 'fractalPreview' );

    var endReal = startReal + width;
    var endI = startI + height;
    mandelbrot( fractalPreview, false, startReal, endReal, startI, endI, cj, ck, null, null );
}

function handleSliderChange( slider ) {
    var val = parseFloat( slider.value );
    if( 'j' == slider.id ) {
        centerJ = val;
    } else {
        centerK = val;
    }

    var centerReal = startReal + width / 2;
    var centerI = startI + height / 2;
    loadPage( centerReal, centerI );
}