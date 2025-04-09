<script lang="ts">
    import Konva from "konva";
    import { SvelteSet } from "svelte/reactivity";
    import { Stage as KonvaStage, Layer as KonvaLayer } from "svelte-konva";
    import ArcShape from "../shapes/arc/ArcShape.svelte";
    import { onMount } from "svelte";
    import { inchesToPixels, mmToInches } from "$lib/components/stage.function";
    import CircleShape from "../shapes/circle/CircleShape.svelte";
    import CubicCurveShape from "../shapes/cubic-curve/CubicCurveShape.svelte";
    import EllipseShape from "../shapes/ellipse/EllipseShape.svelte";
    import LineShape from "../shapes/line/LineShape.svelte";
    import PolyshapeShape from "../shapes/polyshape/PolyshapeShape.svelte";
    import QuadraticCurveShape from "../shapes/quadratic-curve/QuadraticCurveShape.svelte";
    import SplineShape from "../shapes/spline/SplineShape.svelte";
    
    let {
        drawing,
        zoomBy = $bindable(1.0),
        konvaStagePointerX = $bindable(0),
        konvaStagePointerY = $bindable(0),
        stagePointerX = $bindable(0),
        stagePointerY = $bindable(0),
        selectedKonvaShapes = $bindable<SvelteSet<Konva.Shape>>(
            new SvelteSet(),
        ),
    } = $props();

    // Konva Stage state
    //
    let konvaStageWidth = $state(800);
    let konvaStageHeight = $state(800);
    // Translation applied to Stage so that all shapes are visible by default
    let translateX = $state(0);
    let translateY = $state(0);
    // Scaling applied to stage so that parts are real size at zoomBy==1
    let stageScaleBy = inchesToPixels(mmToInches(1));
    let stageScaleX = $derived(stageScaleBy);
    // Mirror Y axis by making scale negative
    let stageScaleY = $derived(-stageScaleBy);
    // Adjust stroke width inversely to scale to maintain visual consistency
    let strokeWidthPx = 1;
    let strokeWidth = $derived(strokeWidthPx / stageScaleBy);

    // Moused-over Konva Shape
    let activeShape = $state<Konva.Shape>();

    // Reference to underlying Konva.Stage object
    let konvaStage = $state<Konva.Stage>();

    // Gets set in onMount
    let konvaStageComponent;
    let layers = $state([]);

    // Track pointer position
    function onPointerMove() {
        const pos = konvaStage?.getPointerPosition();
        // Origin at top-left
        // Apply scale by so that coordinates of shapes don't change
        // konvaStagePointerX = pos?.x / stageScale.x;
        // konvaStagePointerY = pos?.y / stageScale.y;
        konvaStagePointerX = pos?.x / stageScaleX;
        konvaStagePointerY = pos?.y / stageScaleY;
        // Origin at bottom-left
        // Convert to bottom-left origin by flipping Y coordinate
        stagePointerX = konvaStagePointerX;
        stagePointerY = konvaStageHeight - konvaStagePointerY;
    }

    // Track scaling
    function onWheel(e) {
        // Prevent default scroll behavior and stop propagation
        // e.evt.preventDefault();
        // e.evt.stopPropagation();

        const MIN_ZOOM = 0.1; // Prevent going below 10% zoom
        const MAX_ZOOM = 5.0; // Cap at 500% zoom
        const ZOOM_STEP = 0.1; // 10% increments

        const oldScale = konvaStage.scaleX();
        const zoomFactor = oldScale / zoomBy;

        // Determine zoom direction and update zoomBy in 0.05 increments
        if (e.evt.deltaY < 0) {
            zoomBy = Math.min(zoomBy + ZOOM_STEP, MAX_ZOOM);
        } else {
            zoomBy = Math.max(zoomBy - ZOOM_STEP, MIN_ZOOM);
        }

        // Apply scale while preserving sign
        const newScale = zoomBy * zoomFactor;
        const scaleX = newScale * Math.sign(konvaStage.scaleX());
        const scaleY = newScale * Math.sign(konvaStage.scaleY());

        konvaStage.scale({ x: scaleX, y: scaleY });
    }

    // Highlight shape
    function onMouseEnter(e: MouseEvent) {
        activeShape = e.target;
        if (!activeShape?.getAttr("strokeLocked")) {
            activeShape?.setAttr("lastStroke", activeShape.getAttr("stroke"));
            activeShape.setAttr("stroke", "yellow");
        }
    }

    // Remove highlight shape
    function onMouseLeave() {
        if (!activeShape?.getAttr("strokeLocked"))
            activeShape.setAttr("stroke", activeShape.getAttr("lastStroke"));
        activeShape = null;
    }

    // Select shape
    function onClick() {
        // Lock highlight
        activeShape.setAttr(
            "strokeLocked",
            !activeShape.getAttr("strokeLocked"),
        );
        // Add to selected shape list
        if (!selectedKonvaShapes.has(activeShape))
            selectedKonvaShapes.add(activeShape);
        else selectedKonvaShapes.delete(activeShape);
    }

    onMount(async () => {
        konvaStage = konvaStageComponent.handle();

        // Set initial scale
        // stageScale = { x: scaleX, y: scaleY };
        // Offset stage to compensate for mirrored Y axis
        // konvaStage?.y(konvaStageHeight);
        // konvaStage?.scale(stageScale);

        // Translate contents of stage so that origin is 0,0
        const boundingBox = konvaStage.getClientRect();
        const padding = 0; // Padding around shapes in pixels
        // Calculate translation needed to center shapes
        const dx =
            (konvaStageWidth - boundingBox.width) / 2 - boundingBox.x + padding;
        const dy =
            (konvaStageHeight - boundingBox.height) / 2 -
            boundingBox.y +
            padding;
        translateX = dx;
        translateY = dy;

        // Apply translation to stage
        // konvaStage?.position({
        //     x: dx,
        //     y: dy + konvaStageHeight // Add konvaStageHeight to account for Y-axis mirror
        // });
        // konvaStage?.batchDraw();

        console.log('stage scale', stageScaleX, stageScaleY);
    });

    // Load up Konva.Layer array
    layers.push(...drawing.layers);
</script>

<KonvaStage
    bind:this={konvaStageComponent}
    width={konvaStageWidth}
    height={konvaStageHeight}
    scaleX={stageScaleX}
    scaleY={stageScaleY}
    draggable={true}
    onpointermove={onPointerMove}
    onwheel={onWheel}
    x={translateX}
    y={translateY}
>
    {#each layers as layer}
        <KonvaLayer>
            {#each layer.geometries as geometry, i}
                {#if geometry.constructor.name == "Arc"}
                    <ArcShape
                        geometry={layer.geometries[i]}
                        stageScaleBy={stageScaleBy}
                        strokeWidth={strokeWidth}
                        onmouseenter={onMouseEnter}
                        onmouseleave={onMouseLeave}
                        onclick={onClick}
                    ></ArcShape>
                {:else if geometry.constructor.name == "Line"}
                    <LineShape
                        geometry={layer.geometries[i]}
                        stageScaleBy={stageScaleBy}
                        strokeWidth={strokeWidth}
                        onmouseenter={onMouseEnter}
                        onmouseleave={onMouseLeave}
                        onclick={onClick}
                    ></LineShape>
                {:else if geometry.constructor.name == "Circle"}
                    <CircleShape
                        geometry={layer.geometries[i]}
                        stageScaleBy={stageScaleBy}
                        strokeWidth={strokeWidth}
                        onmouseenter={onMouseEnter}
                        onmouseleave={onMouseLeave}
                        onclick={onClick}
                    ></CircleShape>
                {:else if geometry.constructor.name == "CubicCurve"}
                    <CubicCurveShape
                        geometry={layer.geometries[i]}
                        stageScaleBy={stageScaleBy}
                        strokeWidth={strokeWidth}
                        onmouseenter={onMouseEnter}
                        onmouseleave={onMouseLeave}
                        onclick={onClick}
                    ></CubicCurveShape>
                {:else if geometry.constructor.name == "Ellipse"}
                    <EllipseShape
                        geometry={layer.geometries[i]}
                        stageScaleBy={stageScaleBy}
                        strokeWidth={strokeWidth}
                        onmouseenter={onMouseEnter}
                        onmouseleave={onMouseLeave}
                        onclick={onClick}
                    ></EllipseShape>
                {:else if geometry.constructor.name == "Polyshape"}
                    <PolyshapeShape
                        geometry={layer.geometries[i]}
                        stageScaleBy={stageScaleBy}
                        strokeWidth={strokeWidth}
                        onmouseenter={onMouseEnter}
                        onmouseleave={onMouseLeave}
                        onclick={onClick}
                    ></PolyshapeShape>
                {:else if geometry.constructor.name == "QuadraticCurve"}
                    <QuadraticCurveShape
                        geometry={layer.geometries[i]}
                        stageScaleBy={stageScaleBy}
                        strokeWidth={strokeWidth}
                        onmouseenter={onMouseEnter}
                        onmouseleave={onMouseLeave}
                        onclick={onClick}
                    ></QuadraticCurveShape>
                {:else if geometry.constructor.name == "Spline"}
                    <SplineShape
                        geometry={layer.geometries[i]}
                        stageScaleBy={stageScaleBy}
                        strokeWidth={strokeWidth}
                        onmouseenter={onMouseEnter}
                        onmouseleave={onMouseLeave}
                        onclick={onClick}
                    ></SplineShape>
                {/if}
            {/each}
        </KonvaLayer>
    {/each}
</KonvaStage>
