type DragHandlerCallback = (deltas: { dX: number; dY: number }) => void;

export function getDragHandler(callback: DragHandlerCallback) {
  return (mouseDownEvent: { clientX: number; clientY: number }) => {
    let currentX = mouseDownEvent.clientX;
    let currentY = mouseDownEvent.clientY;

    function moveElement(mouseMoveEvent: MouseEvent) {
      const dX = mouseMoveEvent.clientX - currentX;
      const dY = mouseMoveEvent.clientY - currentY;
      currentX = mouseMoveEvent.clientX;
      currentY = mouseMoveEvent.clientY;
      callback({ dX, dY });
    }

    function stopMoving() {
      document.removeEventListener("mousemove", moveElement);
      document.removeEventListener("mouseup", stopMoving);
      document.removeEventListener("blur", stopMoving);
      document.removeEventListener("mouseleave", stopMoving);
    }

    document.addEventListener("mousemove", moveElement);
    document.addEventListener("mouseup", stopMoving);
    document.addEventListener("blur", stopMoving);
    document.addEventListener("mouseleave", stopMoving);
  };
}
