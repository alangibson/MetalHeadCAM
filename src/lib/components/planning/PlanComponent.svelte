<script lang="ts">
    import type { Plan } from "$lib/domain/planning/plan/plan";
    import { Stage as KonvaStage, Layer as KonvaLayer, Line as KonvaLine } from "svelte-konva";
    import type { Component } from "svelte";
    import { PlanningStageState } from "./state.svelte";
    import CutShape from "./shapes/CutShape.svelte";
    import PartShape from "./shapes/PartShape.svelte";

    let {
        plan,
        width,
        height,
    }: { plan: Plan | undefined; width: number; height: number } = $props();

    let konvaStageComponent: Component | undefined = $state();
    $effect(() => {
        const konvaStage = konvaStageComponent?.handle();
        PlanningStageState.konvaStage = konvaStage;
    });

    $effect(() => {
        PlanningStageState.konvaStageWidth = width;
        PlanningStageState.konvaStageHeight = height;
    });

    // var padding = blockSnapSize;
    // for (var i = 0; i < width / padding; i++) {
    //     gridLayer.add(
    //         new Konva.Line({
    //             points: [
    //                 Math.round(i * padding) + 0.5,
    //                 0,
    //                 Math.round(i * padding) + 0.5,
    //                 height,
    //             ],
    //             stroke: "#ddd",
    //             strokeWidth: 1,
    //         }),
    //     );
    // }
    // gridLayer.add(new Konva.Line({ points: [0, 0, 10, 10] }));
    // for (var j = 0; j < height / padding; j++) {
    //     gridLayer.add(
    //         new Konva.Line({
    //             points: [
    //                 0,
    //                 Math.round(j * padding),
    //                 width,
    //                 Math.round(j * padding),
    //             ],
    //             stroke: "#ddd",
    //             strokeWidth: 0.5,
    //         }),
    //     );
    // }
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
    <!-- Grid Layer-->
    <KonvaLayer>
        <KonvaLine
            points={[-10000, 0, 10000, 0]}
            stroke="lightblue"
            strokeWidth={PlanningStageState.strokeWidth}
        />
        <KonvaLine
            points={[0, -10000, 0, 10000]}
            stroke="lightblue"
            strokeWidth={PlanningStageState.strokeWidth}
        />
    </KonvaLayer>

    <!-- TODO Material Layer -->

    <!-- Part Layer -->
    <KonvaLayer>
        {#each plan?.parts as part}
            <PartShape {part}>
                {#each part.cuts as cut}
                    <CutShape {cut}></CutShape>
                {/each}
            </PartShape>
        {/each}
    </KonvaLayer>
</KonvaStage>
