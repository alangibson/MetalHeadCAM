<script lang="ts">
    import Konva from "konva";
    import { SvelteSet } from "svelte/reactivity";
    import { Stage as KonvaStage, Layer as KonvaLayer } from "svelte-konva";
    import ArcShape from "./shapes/arc/ArcShape.svelte";
    import { onMount } from "svelte";
    import type { PointData } from "$lib/geometry/point/point.data";
    import { inchesToPixels, mmToInches } from "$lib/gui/stage.function";
    import { tick } from "svelte";
    import CircleShape from "./shapes/circle/CircleShape.svelte";
    import CubicCurveShape from "./shapes/cubic-curve/CubicCurveShape.svelte";
    import EllipseShape from "./shapes/ellipse/EllipseShape.svelte";
    import LineShape from "./shapes/line/LineShape.svelte";
    import PolyshapeShape from "./shapes/polyshape/PolyshapeShape.svelte";
    import QuadraticCurveShape from "./shapes/quadratic-curve/QuadraticCurveShape.svelte";
    import SplineShape from "./shapes/spline/SplineShape.svelte";

    let {
        drawing,
        scaleBy = $bindable(1.0),
        konvaStagePointerX = $bindable(0),
        konvaStagePointerY = $bindable(0),
        stagePointerX = $bindable(0),
        stagePointerY = $bindable(0),
        selectedKonvaShapes = $bindable<SvelteSet<Konva.Shape>>(
            new SvelteSet(),
        ),
    } = $props();

    let layers = $state([]);
    let konvaStageWidth = $state(800);
    let konvaStageHeight = $state(800);
    let konvaStageComponent;
    let konvaStage = $state<Konva.Stage>();
    // Moused-over shape
    let activeShape = $state<Konva.Shape>();

    // Track pointer position
    function onPointerMove() {
        const pos = konvaStage.getPointerPosition();
        // Origin at top-left
        // Apply scale by so that coordinates of shapes don't change
        konvaStagePointerX = pos?.x / scaleBy;
        konvaStagePointerY = pos?.y / scaleBy;
        // Origin at bottom-left
        // Convert to bottom-left origin by flipping Y coordinate
        stagePointerX = konvaStagePointerX;
        stagePointerY = konvaStageHeight - konvaStagePointerY;
    }

    // Track scaling
    function onWheel(e) {
        // Prevent default scroll behavior and stop propagation
        e.evt.preventDefault();
        e.evt.stopPropagation();

        const MIN_ZOOM = 0.1; // Prevent going below 10% zoom
        const MAX_ZOOM = 5.0; // Cap at 500% zoom
        const ZOOM_STEP = 0.1; // 10% increments

        const oldScale = konvaStage.scaleX();
        const zoomFactor = oldScale / scaleBy;

        // Determine zoom direction and update scaleBy in 0.05 increments
        if (e.evt.deltaY < 0) {
            scaleBy = Math.min(scaleBy + ZOOM_STEP, MAX_ZOOM);
        } else {
            scaleBy = Math.max(scaleBy - ZOOM_STEP, MIN_ZOOM);
        }

        // Apply scale while preserving sign
        const newScale = scaleBy * zoomFactor;
        const scaleX = newScale * Math.sign(konvaStage.scaleX());
        const scaleY = newScale * Math.sign(konvaStage.scaleY());

        konvaStage.scale({ x: scaleX, y: scaleY });
    }

    // Highlight shape
    function onMouseEnter(e: MouseEvent) {
        activeShape = e.target;
        if (! activeShape?.getAttr('strokeLocked')) {
            activeShape?.setAttr('lastStroke', activeShape.getAttr('stroke'));
            activeShape.setAttr('stroke', 'yellow');
        }
    }

    // Remove highlight shape
    function onMouseLeave() {
        if (! activeShape?.getAttr('strokeLocked'))
            activeShape.setAttr('stroke', activeShape.getAttr('lastStroke'));
        activeShape = null;
    }

    // Select shape
    function onClick() {
        // Lock highlight
        activeShape.setAttr('strokeLocked', ! activeShape.getAttr('strokeLocked'))
        // Add to selected shape list
        if (! selectedKonvaShapes.has(activeShape))
            selectedKonvaShapes.add(activeShape);
        else
            selectedKonvaShapes.delete(activeShape);
    }

    // Reorient Konva.Stage
    function reorientKonvaStage(origin: PointData, mirror: PointData) {
        // FIXME BB is all zeros
        // Translate contents of stage so that origin is 0,0
        const boundingBox = konvaStage.getClientRect();

        // Calculate the translation needed to move boundingBox origin to target origin
        const dx = origin.x - boundingBox.x;
        const dy = origin.y - boundingBox.y;
        // Apply translation to all layers in the stage
        konvaStage.getLayers().forEach((layer) => {
            // Also translate all shapes within each layer
            layer.getChildren().forEach((shape) => {
                shape.fire("transformstart");
                // Handle Line shapes specially since they use points array
                if (shape instanceof Konva.Line) {
                    const points = shape.points();
                    for (let i = 0; i < points.length; i += 2) {
                        points[i] += dx;
                        points[i + 1] += dy;
                    }
                    shape.points(points);
                } else {
                    shape.position({ x: shape.x() + dx, y: shape.y() + dy });
                }
                shape.fire("transformend");
            });
        });

        // Mirror x and y axis if needed
        if (mirror.y !== 0) {
            konvaStage.scaleY(-1);
            konvaStage.y(mirror.y);
        }
        // TODO x axis also?

        // Scale up based on drawing untis
        // TODO assuming mm here
        konvaStage.scaleX(konvaStage.scaleX() * inchesToPixels(mmToInches(1)));
        konvaStage.scaleY(konvaStage.scaleY() * inchesToPixels(mmToInches(1)));

        // Update stage
        konvaStage.batchDraw();
    }

    onMount(async () => {
        konvaStage = konvaStageComponent.handle();
        // We have to wait 1 tick for Konva components to load before reorienting
        await tick();
        // TODO bring this back
        reorientKonvaStage({ x: 0, y: 0 }, { x: 0, y: konvaStageHeight });
    });

    // Load up Konva.Layer array
    layers.push(...drawing.layers);
</script>

<KonvaStage
    bind:this={konvaStageComponent}
    width={konvaStageWidth}
    height={konvaStageHeight}
    draggable={true}
    onpointermove={onPointerMove}
    onwheel={onWheel}
>
    {#each layers as layer}
        <KonvaLayer>
            {#each layer.geometries as geometry, i}
                {#if geometry.constructor.name == "Arc"}
                    <ArcShape
                        geometry={layer.geometries[i]}
                        onmouseenter={onMouseEnter}
                        onmouseleave={onMouseLeave}
                        onclick={onClick}
                    ></ArcShape>
                {:else if geometry.constructor.name == "Line"}
                    <LineShape
                        geometry={layer.geometries[i]}
                        onmouseenter={onMouseEnter}
                        onmouseleave={onMouseLeave}
                        onclick={onClick}
                    ></LineShape>
                {:else if geometry.constructor.name == "Circle"}
                    <CircleShape
                        geometry={layer.geometries[i]}
                        onmouseenter={onMouseEnter}
                        onmouseleave={onMouseLeave}
                        onclick={onClick}
                    ></CircleShape>
                {:else if geometry.constructor.name == "CubicCurve"}
                    <CubicCurveShape
                        geometry={layer.geometries[i]}
                        onmouseenter={onMouseEnter}
                        onmouseleave={onMouseLeave}
                        onclick={onClick}
                    ></CubicCurveShape>
                {:else if geometry.constructor.name == "Ellipse"}
                    <EllipseShape
                        geometry={layer.geometries[i]}
                        onmouseenter={onMouseEnter}
                        onmouseleave={onMouseLeave}
                        onclick={onClick}
                    ></EllipseShape>
                {:else if geometry.constructor.name == "Polyshape"}
                    <PolyshapeShape
                        geometry={layer.geometries[i]}
                        onmouseenter={onMouseEnter}
                        onmouseleave={onMouseLeave}
                        onclick={onClick}
                    ></PolyshapeShape>
                {:else if geometry.constructor.name == "QuadraticCurve"}
                    <QuadraticCurveShape
                        geometry={layer.geometries[i]}
                        onmouseenter={onMouseEnter}
                        onmouseleave={onMouseLeave}
                        onclick={onClick}
                    ></QuadraticCurveShape>
                {:else if geometry.constructor.name == "Spline"}
                    <SplineShape
                        geometry={layer.geometries[i]}
                        onmouseenter={onMouseEnter}
                        onmouseleave={onMouseLeave}
                        onclick={onClick}
                    ></SplineShape>
                {/if}
            {/each}
        </KonvaLayer>
    {/each}
</KonvaStage>
