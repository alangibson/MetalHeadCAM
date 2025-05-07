<script lang="ts">
    import PolyshapeShape from "$lib/components/shapes/polyshape/PolyshapeShape.svelte";
    import type { Cut } from "$lib/domain/planning/cut/cut";
    import { Group as KonvaGroup } from "svelte-konva";
    import { PlanningStageState } from "$lib/components/planning/state.svelte";
    import {
        DEFAULT_COLOR_POLYSHAPE,
        DEFAULT_COLOR_SELECTED_PATH,
    } from "$lib/domain/importing/config/defaults";
    import LineShape from "$lib/components/shapes/line/LineShape.svelte";

    let { cut }: { cut: Cut } = $props();

    let strokeColor: string = $derived(
        PlanningStageState.selectedEntities.has(cut) ||
            PlanningStageState.hoveredEntities.has(cut)
            ? DEFAULT_COLOR_SELECTED_PATH
            : DEFAULT_COLOR_POLYSHAPE,
    );
</script>

<KonvaGroup
    onclick={(e) => PlanningStageState.onClickEntity(e, cut)}
    onmouseenter={(e) => PlanningStageState.onMouseEnterEntity(e, cut)}
    onmouseleave={(e) => PlanningStageState.onMouseLeaveEntity(e, cut)}
>
    <!-- Render rapid in -->
    {#if cut.rapidIn}
        <LineShape
            geometry={cut.rapidIn}
            onclick={(e) => PlanningStageState.onClickEntity(e, cut.rapidIn)}
            onmouseenter={(e) =>
                PlanningStageState.onMouseEnterEntity(e, cut.rapidIn)}
            onmouseleave={(e) =>
                PlanningStageState.onMouseLeaveEntity(e, cut.rapidIn)}
        ></LineShape>
    {/if}

    <!-- TODO render lead in -->

    <PolyshapeShape
        geometry={cut.path}
        strokeWidth={PlanningStageState.strokeWidth}
        {strokeColor}
        onclick={(e) => PlanningStageState.onClickEntity(e, cut.path)}
        onmouseenter={(e) => PlanningStageState.onMouseEnterEntity(e, cut.path)}
        onmouseleave={(e) => PlanningStageState.onMouseLeaveEntity(e, cut.path)}
    ></PolyshapeShape>

    <!-- TODO render offset -->

    <!-- TODO render lead out -->

    <!-- TODO render rapid out -->
</KonvaGroup>
