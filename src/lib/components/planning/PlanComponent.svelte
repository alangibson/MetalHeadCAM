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
        {#each plan?.parts as part, part_i}
            <KonvaGroup>
                {#each part.cuts as cut, cut_i}
                    <!-- TODO render rapid in -->
                    <!-- TODO render lead in -->
                    <PolyshapeShape
                        geometry={cut.path}
                        stageScaleBy={PlanningStageState.stageScaleBy}
                        strokeWidth={PlanningStageState.strokeWidth}
                        onmouseenter={PlanningStageState.onMouseEnter}
                        onmouseleave={PlanningStageState.onMouseLeave}
                        onclick={PlanningStageState.onClick}
                    ></PolyshapeShape>
                    <!-- TODO render offset -->
                    <!-- TODO render lead out -->
                    <!-- TODO render rapid out -->
                {/each}
            </KonvaGroup>
        {/each}
    </KonvaLayer>
</KonvaStage>
