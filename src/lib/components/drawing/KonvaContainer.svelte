<script lang="ts">
    import { Stage as KonvaStage, Layer as KonvaLayer } from "svelte-konva";
    import ArcShape from "../shapes/arc/ArcShape.svelte";
    import {type Component } from "svelte";
    import CircleShape from "../shapes/circle/CircleShape.svelte";
    import EllipseShape from "../shapes/ellipse/EllipseShape.svelte";
    import LineShape from "../shapes/line/LineShape.svelte";
    import PolyshapeShape from "../shapes/polyshape/PolyshapeShape.svelte";
    import SplineShape from "../shapes/spline/SplineShape.svelte";
    import { DrawingStageState } from "./state.svelte";
    
    let {
        drawing,
    } = $props();

    let konvaStageComponent: Component|undefined = $state();
    $effect(() => {
        const konvaStage = konvaStageComponent?.handle();
        DrawingStageState.konvaStage = konvaStage;
    });
</script>

<KonvaStage
    bind:this={konvaStageComponent}
    draggable={true}
    width={DrawingStageState.konvaStageWidth}
    height={DrawingStageState.konvaStageHeight}
    x={DrawingStageState.translateX}
    y={DrawingStageState.translateY}
    scaleX={DrawingStageState.stageScaleX}
    scaleY={DrawingStageState.stageScaleY}
    onpointermove={DrawingStageState.onPointerMove}
    onwheel={DrawingStageState.onWheel}
>
    {#each drawing.layers as layer}
        <KonvaLayer>
            {#each layer.geometries as geometry, i}
                {#if geometry.constructor.name == "Arc"}
                    <ArcShape
                        geometry={layer.geometries[i]}
                        stageScaleBy={DrawingStageState.stageScaleBy}
                        strokeWidth={DrawingStageState.strokeWidth}
                        onmouseenter={DrawingStageState.onMouseEnter}
                        onmouseleave={DrawingStageState.onMouseLeave}
                        onclick={DrawingStageState.onClick}
                    ></ArcShape>
                {:else if geometry.constructor.name == "Line"}
                    <LineShape
                        geometry={layer.geometries[i]}
                        stageScaleBy={DrawingStageState.stageScaleBy}
                        strokeWidth={DrawingStageState.strokeWidth}
                        onmouseenter={DrawingStageState.onMouseEnter}
                        onmouseleave={DrawingStageState.onMouseLeave}
                        onclick={DrawingStageState.onClick}
                    ></LineShape>
                {:else if geometry.constructor.name == "Circle"}
                    <CircleShape
                        geometry={layer.geometries[i]}
                        stageScaleBy={DrawingStageState.stageScaleBy}
                        strokeWidth={DrawingStageState.strokeWidth}
                        onmouseenter={DrawingStageState.onMouseEnter}
                        onmouseleave={DrawingStageState.onMouseLeave}
                        onclick={DrawingStageState.onClick}
                    ></CircleShape>
                {:else if geometry.constructor.name == "Ellipse"}
                    <EllipseShape
                        geometry={layer.geometries[i]}
                        stageScaleBy={DrawingStageState.stageScaleBy}
                        strokeWidth={DrawingStageState.strokeWidth}
                        onmouseenter={DrawingStageState.onMouseEnter}
                        onmouseleave={DrawingStageState.onMouseLeave}
                        onclick={DrawingStageState.onClick}
                    ></EllipseShape>
                {:else if geometry.constructor.name == "Polyshape"}
                    <PolyshapeShape
                        geometry={layer.geometries[i]}
                        stageScaleBy={DrawingStageState.stageScaleBy}
                        strokeWidth={DrawingStageState.strokeWidth}
                        onmouseenter={DrawingStageState.onMouseEnter}
                        onmouseleave={DrawingStageState.onMouseLeave}
                        onclick={DrawingStageState.onClick}
                    ></PolyshapeShape>
                {:else if geometry.constructor.name == "Spline"}
                    <SplineShape
                        geometry={layer.geometries[i]}
                        stageScaleBy={DrawingStageState.stageScaleBy}
                        strokeWidth={DrawingStageState.strokeWidth}
                        onmouseenter={DrawingStageState.onMouseEnter}
                        onmouseleave={DrawingStageState.onMouseLeave}
                        onclick={DrawingStageState.onClick}
                    ></SplineShape>
                {/if}
            {/each}
        </KonvaLayer>
    {/each}
</KonvaStage>
