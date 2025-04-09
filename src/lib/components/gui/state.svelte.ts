import type Konva from "konva";
import { inchesToPixels, mmToInches } from "../stage.function";
import type { KonvaPointerEvent, KonvaWheelEvent } from "svelte-konva";
import { SvelteSet } from "svelte/reactivity";

/**
 * Add a lot of useful features to Konva.Stage.
 * 
 * This is intentionally not a Svelte component. By having a class we can easily share
 * state between many Svelte components.
 */
export class StageState {

    // Reference to underlying Konva.Stage object
    konvaStage = $state<Konva.Stage>();

    konvaStageWidth = $state(800);
    konvaStageHeight = $state(800);

    // Translation applied to Stage so that all shapes are visible by default
    // translateX = $state(0);
    // translateY = $state(0);

    zoomBy = $state(1.0);
    // Scaling applied to stage so that parts are real size at zoomBy==1
    stageScaleBy = $state(inchesToPixels(mmToInches(1)));
    // Scaling applied to stage so that parts are real size at zoomBy==1
    // let stageScaleBy = inchesToPixels(mmToInches(1));
    stageScaleX = $derived(this.stageScaleBy);
    // Mirror Y axis by making scale negative
    stageScaleY = $derived(-this.stageScaleBy);
    // Adjust stroke width inversely to scale to maintain visual consistency
    strokeWidthPx = 1;
    strokeWidth = $derived(this.strokeWidthPx / this.stageScaleBy);

    // Moused-over Konva Shape
    activeShape = $state<Konva.Shape>();
    // List of selected shapes
    selectedKonvaShapes = $state<SvelteSet<Konva.Shape>>(
        new SvelteSet(),
    );

    konvaStagePointerX = $state(0);
    konvaStagePointerY = $state(0);
    stagePointerX = $state(0);
    stagePointerY = $state(0);

    boundingBox = $derived.by(() => this.konvaStage?.getClientRect());

    // Translate contents of stage so that origin is 0,0
    translateX = $derived(((this.konvaStageWidth - this.boundingBox?.width) / 2 - this.boundingBox?.x) || 0);
    translateY = $derived(((this.konvaStageHeight - this.boundingBox?.height) / 2 -
        this.boundingBox?.y) || 0);

    // Track scaling
    // Defined as arrow function since it's passed as a callback
    onWheel = (e: KonvaWheelEvent) => {

        const MIN_ZOOM = 0.1; // Prevent going below 10% zoom
        const MAX_ZOOM = 5.0; // Cap at 500% zoom
        const ZOOM_STEP = 0.1; // 10% increments

        const oldScale = this.konvaStage.scaleX();
        const zoomFactor = oldScale / this.zoomBy;

        // Determine zoom direction and update zoomBy in  increments
        if (e.evt.deltaY < 0) {
            this.zoomBy = Math.min(this.zoomBy + ZOOM_STEP, MAX_ZOOM);
        } else {
            this.zoomBy = Math.max(this.zoomBy - ZOOM_STEP, MIN_ZOOM);
        }

        // Apply scale while preserving sign
        const newScale = this.zoomBy * zoomFactor;
        const scaleX = newScale * Math.sign(this.konvaStage.scaleX());
        const scaleY = newScale * Math.sign(this.konvaStage.scaleY());

        this.konvaStage.scale({ x: scaleX, y: scaleY });
    }

    // Track pointer position.
    // Defined as arrow function since it's passed as a callback.
    onPointerMove = (e: KonvaPointerEvent) => {
        const pos = this.konvaStage?.getPointerPosition();
        // Origin at top-left
        // Apply scale by so that coordinates of shapes don't change
        // konvaStagePointerX = pos?.x / stageScale.x;
        // konvaStagePointerY = pos?.y / stageScale.y;
        this.konvaStagePointerX = pos.x / this.stageScaleX;
        this.konvaStagePointerY = pos.y / this.stageScaleY;
        // Origin at bottom-left
        // Convert to bottom-left origin by flipping Y coordinate
        this.stagePointerX = this.konvaStagePointerX;
        this.stagePointerY = this.konvaStageHeight - this.konvaStagePointerY;
    }

    // Highlight shape on mouseover.
    // Defined as arrow function since it's passed as a callback.
    onMouseEnter = (e: MouseEvent) => {
        this.activeShape = e.target;
        if (!this.activeShape?.getAttr("strokeLocked")) {
            this.activeShape?.setAttr("lastStroke", this.activeShape.getAttr("stroke"));
            this.activeShape.setAttr("stroke", "yellow");
        }
    }

    // Remove highlight shape on mouseout.
    // Defined as arrow function since it's passed as a callback.
    onMouseLeave = () => {
        if (!this.activeShape?.getAttr("strokeLocked"))
            this.activeShape.setAttr("stroke", this.activeShape.getAttr("lastStroke"));
        this.activeShape = undefined;
    }

    // Select shape.
    // Defined as arrow function since it's passed as a callback.
    onClick = () => {
        // Lock highlight
        this.activeShape.setAttr(
            "strokeLocked",
            !this.activeShape.getAttr("strokeLocked"),
        );
        // Add to selected shape list
        if (!this.selectedKonvaShapes.has(this.activeShape))
            this.selectedKonvaShapes.add(this.activeShape);
        else this.selectedKonvaShapes.delete(this.activeShape);
    }

}
