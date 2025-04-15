<script lang="ts">
    import type { Part } from "$lib/domain/planning/part/part";
    import { render } from "svelte/server";
    import { PlanningStageState } from "../state.svelte";
    import { Group as KonvaGroup } from "svelte-konva";

    let { part, children = null }: { part: Part } = $props();
</script>

<KonvaGroup onclick={(e) => PlanningStageState.onClickEntity(e, part)}>
    {@render children()}
</KonvaGroup>
