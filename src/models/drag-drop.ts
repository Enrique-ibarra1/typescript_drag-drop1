
//drag & drop interfaces
export interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

export interface DragTarget {
    //permits the drop to hover over target
    dragOverHandler(event: DragEvent): void;
    //allows drop logic
    dropHandler(event: DragEvent): void;
    //reverting visual update
    dragLeaveHandler(event: DragEvent): void;
}