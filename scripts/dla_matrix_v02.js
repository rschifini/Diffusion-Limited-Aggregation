var cv, ctx, matrix, center, anim, bndBox, iteration; 
var step = 1500;
var limit = 15000;
var delta = 15;
window.onload = setup;

function setup() {
    bndBox = {x1:Infinity,x2:-Infinity,y1:Infinity,y2:-Infinity};
    iteration = limit;
    cv = document.getElementById('canvas')
    ctx = cv.getContext('2d');
    center = Math.floor(cv.width/2);
    matrix = createMatrix(cv.width);

    placePoint(center,center,1/limit);
    anim = window.requestAnimationFrame(dla_anim);
}

// ------------ helper functions

function checkContact(point) {
    return(matrix[point.x+1][point.y] > 0 ||
        matrix[point.x-1][point.y] > 0 ||
        matrix[point.x][point.y+1] > 0 ||
        matrix[point.x][point.y-1] > 0);
}

function createPoint() {
    var side = Math.floor(Math.random()*4);
    switch (side) {
        case 0:
            var x = bndBox.x1;
            var y = Math.floor(Math.random()*(bndBox.y2-bndBox.y1))+bndBox.y1;
            break;
        case 1:
            var x = bndBox.x2;
            var y = Math.floor(Math.random()*(bndBox.y2-bndBox.y1))+bndBox.y1;
            break;
        case 2:
            var y = bndBox.y1;
            var x = Math.floor(Math.random()*(bndBox.x2-bndBox.x1))+bndBox.x1;
            break;
        case 3:
            var y = bndBox.y2;
            var x = Math.floor(Math.random()*(bndBox.x2-bndBox.x1))+bndBox.x1;
            break;
    }
    return({x:x, y:y})
}

function movePoint(x, y) {
    var moveDir = Math.floor(Math.random()*4);
    switch (moveDir) {
        case 0:
            x +=1;
            break;
        case 1:
            x -=1;
            break;
        case 2:
            y +=1;
            break;
        case 3:
            y -=1;
            break;
        case 4:
            x -=1;
            y -=1;
            break;
        case 5:
            x +=1;
            y -=1;
            break;
        case 6:
            x -=1;
            y +=1;
            break;
        case 7:
            x +=1;
            y +=1;
            break;
    }
    return {x:x,y:y}
}

// -------------- dla functions

function dla_anim() {
    if(iteration<=0){
        window.cancelAnimationFrame(anim);
        return undefined;
    } 
    for (let k = 1; k <= step; k++) {
        iteration--;
        onePoint(k);
        if(ooBounds(bndBox)){
            iteration=0;
            break;
        } 
    }
    plot(matrix);
    anim = window.requestAnimationFrame(dla_anim);
}

function ooBounds(box) {
    return (box.x1 <= 0 || box.x2>=matrix.length || box.y1 <= 0 || box.y2>=matrix.length)
}

function pointOutofBounds(point, bndBox) {
    return (point.x < bndBox.x1 || point.x > bndBox.x2 || point.y < bndBox.y1 || point.y > bndBox.y2)   
}

function onePoint(order) {
    var point = createPoint();
    var destination = movePoint(point.x,point.y);
    var occupied = checkContact(destination);
    while (true) {
        if(!occupied){
            if(pointOutofBounds(destination,bndBox)){
                destination = point;
            }            
            point = {x:destination.x,y:destination.y};
            destination = movePoint(point.x,point.y);
            occupied = checkContact(destination);
            if(occupied==undefined) destination = createPoint();
        }else{
            placePoint(destination.x,destination.y,order);
            break;
        }
    }
}

// --------------- matrix creation and modification

function placePoint(x,y,order) {
    bndBox.x1 = Math.min(x, bndBox.x1+delta)-delta;
    bndBox.x2 = Math.max(x, bndBox.x2-delta)+delta;
    bndBox.y1 = Math.min(y, bndBox.y1+delta)-delta;
    bndBox.y2 = Math.max(y, bndBox.y2-delta)+delta;
    matrix[x][y] = order;
}

function placeLine(center,width) {
    for (let k = Math.floor(center-width/2); k < Math.floor(center+width/2); k++) {
        placePoint(center,k,1/limit);
    }
}

function createMatrix(size) {
    var v=[];
    for (let k = 0; k < size; k++) {
        let z = [];
        for (let j = 0; j < size; j++) {
            z.push(0);
        }
        v.push(z);
    }
    return v
}

// -------------------- plotting to canvas

function plot(matrix){
    // var z = matrix.join(',').split(',').map(x=>[x*0/step,x*255/step,x*55/step,255]).join(',').split(',').map(x=>1*x);
    var z = matrix.join(',').split(',').map(x=>[250*x/step,205,55*x/step,255*x/step]).join(',').split(',').map(x=>1*x);
    // var z = matrix.join(',').split(',').map(x=>[0,70+55*x/step,20+5*x/step,255*x]).join(',').split(',').map(x=>1*x);
    const imgData = new ImageData(Uint8ClampedArray.from(z), matrix.length, matrix.length);
    ctx.putImageData(imgData,0,0);
}


// -------------------- reload on key or click

document.body.onclick = function(ev) {
    // location.reload();
    window.cancelAnimationFrame(anim);
    ctx.fill = '#000';
    ctx.fillRect(0,0,cv.width,cv.height);
    setup();
}