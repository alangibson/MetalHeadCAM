<script lang="ts">
    import type { Plan } from "$lib/domain/planning/plan/plan";
    import {
        Stage as KonvaStage,
        Layer as KonvaLayer,
        Group as KonvaGroup,
    } from "svelte-konva";
    import PolyshapeShape from "../shapes/polyshape/PolyshapeShape.svelte";
    import type { Component } from "svelte";
    import { PlanningStageState } from "./state.svelte";
    import CutShape from "./shapes/CutShape.svelte";
    import PartShape from "./shapes/PartShape.svelte";
    
    let { 
        plan,
     }: { plan: Plan | undefined } = $props();

    let konvaStageComponent: Component|undefined = $state();
    $effect(() => {
        const konvaStage = konvaStageComponent?.handle();
        PlanningStageState.konvaStage = konvaStage;
    });
</script>

<KonvaStage
    bind:this={konvaStageComponent}
    draggable={true}
    width={PlanningStageState.konvaStageWidth}
    height={PlanningStageState.konvaStageHeight}
    x={PlanningStageState.translateX}
    y={PlanningStageState.translateY}
    scaleX={PlanningStageState.stageScaleX}
    scaleY={PlanningStageState.stageScaleY}
    onpointermove={PlanningStageState.onPointerMove}
    onwheel={PlanningStageState.onWheel}
>
    <KonvaLayer>
        {#each plan?.parts as part}
            <PartShape {part} onclick={() => console.log('Part')}>
                {#each part.cuts as cut}
                    <CutShape {cut} onclick={() => console.log('Cut')}></CutShape>
                {/each}
            </PartShape>
        {/each}
    </KonvaLayer>
</KonvaStage>
