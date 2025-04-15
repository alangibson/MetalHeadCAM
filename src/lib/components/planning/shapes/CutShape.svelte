<script lang="ts">
    import PolyshapeShape from "$lib/components/shapes/polyshape/PolyshapeShape.svelte";
    import type { Cut } from "$lib/domain/planning/cut/cut";
    import { PlanningStageState } from "../state.svelte";
    import { Group as KonvaGroup } from "svelte-konva";

    let { cut }: { cut: Cut } = $props();
</script>

<KonvaGroup onclick={(e) => PlanningStageState.onClickEntity(e, cut)}>
    <!-- TODO render rapid in -->
    <!-- TODO render lead in -->
    <PolyshapeShape
        geometry={cut.path}
        stageScaleBy={PlanningStageState.stageScaleBy}
        strokeWidth={PlanningStageState.strokeWidth}
        onclick={PlanningStageState.onClick}
        onmouseenter={PlanningStageState.onMouseEnter}
        onmouseleave={PlanningStageState.onMouseLeave}
    ></PolyshapeShape>
    <!-- TODO render offset -->
    <!-- TODO render lead out -->
    <!-- TODO render rapid out -->
</KonvaGroup>
