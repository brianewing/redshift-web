// Prevents drag click events 
function cancelNextClickEvent(element) {
    function cancel(e) {
        element.removeEventListener('click', cancel)
        e.preventDefault()
        e.stopPropagation()
    }
    element.addEventListener('click', cancel)
}

function touchHasMoved(event) {
    const touch = event.changedTouches[0]
    const threshold = 10;

    if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
        return true;
    }

    return false;
}

export default function preventDragClickEvents(rootEl=document.body) {
    rootEl.addEventListener('mousemove', (e) => {
        if(e.altKey)
            console.log('mousemove', 'cancel', e, e.currentTarget)
        cancelNextClickEvent(e.currentTarget)
    })
}