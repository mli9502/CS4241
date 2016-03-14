/*
Author: Mengwen Li (mli2)
*/
// Title changing color with mouse movement.
var header = document.getElementsByTagName('header');
header[0].addEventListener('mousemove', handleMouseMove);
var h = 0, s = 0, l = 0;
var hplus = true;
var splus = true;
var lplus = true;
function handleMouseMove(e){
    // console.log(e.clientX);
    // console.log(e.clientY);
    if(hplus){
        h += 1;
    }else{
        h -= 1;
    }
    if(splus){
        s += 0.01;
    }else{
        s -= 0.01;
    }
    if(lplus){
        l += 0.01;
    }else{
        l -= 0.01;
    }
    if(h > 360){
        hplus = false;
    }
    if(s > 1){
        splus = false;
    }
    if(l > 1){
        lplus = false;
    }
    if(h < 0){
        hplus = true;
    }
    if(s < 0){
        splus = true;
    }
    if(l < 0){
        lplus = true;
    }
    console.log(hplus, splus, lplus);
    console.log(h, s, l);
    header[0].style.color = 'hsl(' + h + ',' + s * 100 + '%,' + l * 100 + "%)";
    // header[0].style.color = 'hsl(' + (e.clientX + e.clientY) % 360 + ',' + e.clientX % 100 + '%,' + e.clientY % 100 + "%)";
}

// Scroll
var sideBar = document.getElementById('side-bar');
var offset = sideBar.offsetTop;
var parent = sideBar;
while(parent = parent.offsetParent){
    if(parent.offsetTop){
        offset += parent.offsetTop;
    }
}
window.addEventListener('scroll', function(e){
    var scrollPos = document.body.scrollTop;
    if(scrollPos > offset){
        if(scrollPos < (document.body.scrollHeight - sideBar.clientHeight - offset)){
            sideBar.style.top = (scrollPos - offset) + 'px';
        }
    }else{
        sideBar.style.top = '0px';
    }
});

var dragEle = document.getElementById('drag-pic');
var dropDiv = document.getElementById('drop-tar');
var eleDragged = null;
// Add event listener for drag source.
dragEle.addEventListener('dragstart', handleStartDrag);
dragEle.addEventListener('dragend', handleDragEnd);
dragEle.addEventListener('dragover', handleDragOver);
dragEle.addEventListener('drop', handleDropRev);
// Add event listener for drag target.
dropDiv.addEventListener('dragstart', handleStartDrag);
dropDiv.addEventListener('dragend', handleDragEnd);
dropDiv.addEventListener('dragover', handleDragOver);
dropDiv.addEventListener('drop', handleDrop);

// Bubble demo
var bubbleEles = document.getElementsByClassName('bubble');
var capBtn = document.getElementById('cap-button');
var bubBtn = document.getElementById('bub-button');
var info = document.getElementById('demo-info');
// Add bubble demo as default.
// bubbleDemo();
// Register different event listener according to the button clicked.
capBtn.addEventListener('click', captureDemo);
bubBtn.addEventListener('click', bubbleDemo);

function bubbleDemo(){
    Array.prototype.forEach.call(bubbleEles, function(bEl, i){
        bEl.style.backgroundColor = 'transparent';
    });
    Array.prototype.forEach.call(bubbleEles, function(bEl, i){
        // Default is bubble.
        addClickHandlerBubble(bEl, i);
        // addClickHandlerCapture(bEl, i);
    });
    capBtn.disabled = true;
    bubBtn.disabled = true;
    var paragraph = '<h3>Explanation for "Use bubble"</h3><p>' + 'Click layer 3 to see the result.<br><br>When using bubble, layer 3 is first colored, then, layer 2 and in the last, layer 1. <br><br>The order of click event handler is called is shown in the following:' + '</p>';
    info.innerHTML = paragraph;
}
function captureDemo(){
    Array.prototype.forEach.call(bubbleEles, function(bEl, i){
        bEl.style.backgroundColor = 'transparent';
    });
    Array.prototype.forEach.call(bubbleEles, function(bEl, i){
        // Default is bubble.
        // addClickHandlerBubble(bEl, i);
        addClickHandlerCapture(bEl, i);
    });
    // Disable both buttons after clicking.
    capBtn.disabled = true;
    bubBtn.disabled = true;
    var paragraph = '<h3>Explanation for "Use capture"</h3><p>' + 'Click layer 3 to see the result.<br><br>When using capture, layer 1 is first colored, then, layer 2 and in the last, layer 3. <br><br>The order of click event handler is called is shown in the following: ' + '</p>';
    info.innerHTML = paragraph;
}
// // Third arg: use capture
// // false: bubble
// // true: capture

// addClickHandler(bubbleEle1, 1);
var colors = ['steelblue', 'yellow', 'red'];
// var delays = [0, 1000, 2000, 3000, 4000, 5000];
var delays_bubble = [2000, 1000, 0];
var delays_capture = [0, 1000, 2000];
function addClickHandlerBubble(ele, loc){
    // console.log('In handle bubble function');
    function acListenerBubble(e){
        info.innerHTML += '<ol>'
        info.innerHTML += '<li>' + ele.getElementsByClassName('demo-contents')[0].innerHTML + '</li>';
        info.innerHTML += '</ol>'
        setTimeout(function(){
            ele.style.backgroundColor = colors[loc];
            ele.removeEventListener('click', acListenerBubble);
            if(delays_bubble[loc] == 2000){
                capBtn.disabled = false;
                bubBtn.disabled = false;
            }
        }, delays_bubble[loc]);
    }
    ele.addEventListener('click', acListenerBubble, false);
}
function addClickHandlerCapture(ele, loc){
    function acListenerCapture(e){
        info.innerHTML += '<ol>'
        info.innerHTML += '<li>' + ele.getElementsByClassName('demo-contents')[0].innerHTML + '</li>';
        info.innerHTML += '</ol>'
        setTimeout(function(){
            ele.style.backgroundColor = colors[loc];
            ele.removeEventListener('click', acListenerCapture, true);
            if(delays_capture[loc] == 2000){
                capBtn.disabled = false;
                bubBtn.disabled = false;
            }
        }, delays_capture[loc]);
    }
    ele.addEventListener('click', acListenerCapture, true);
}

// Handle the reverse drop.
function handleDropRev(e){
    if(e.preventDefault){
        e.preventDefault();
    }
    if(e.stopPropagation){
        e.stopPropagation();
    }
    this.innerHTML = e.dataTransfer.getData('pic');
    document.getElementById('drop-tar').innerHTML = '<div id="instruction">Drag the image here!</div>';
    document.getElementById('drop-tar').className = 'right-bar-empty-pos-l';
    document.getElementById('drag-pic').style.opacity = 1;
    return false;
}
// Handle normal drop.
function handleDrop(e){
    if(e.preventDefault){
        e.preventDefault();
    }
    if(e.stopPropagation){
        e.stopPropagation();
    }
    this.innerHTML = e.dataTransfer.getData('pic');
    document.getElementById('drag-pic').innerHTML = '<div id="instruction">Drag the image here!</div>';
    document.getElementById('drag-pic').className = 'right-bar-empty-pos-r';
    document.getElementById('drop-tar').style.opacity = 1;
    return false;
}
// Handle the image over div.
function handleDragOver(e){
    if(e.preventDefault){
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}
// Handle start drag.
function handleStartDrag(e){
    console.log(e);
    console.log('Div is being dragged.');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('pic', this.innerHTML);
    eleDragged = this;
    this.style.opacity = 0.4;
}
// Hnadle end drag.
function handleDragEnd(e){
    eleDragged = null;
    this.style.opacity = 1;
}
