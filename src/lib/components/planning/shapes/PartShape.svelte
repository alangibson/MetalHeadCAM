<script lang="ts">
    import type { Part } from "$lib/domain/planning/part/part";
    import { Group as KonvaGroup } from "svelte-konva";

    let { part, children = null }: { part: Part } = $props();
</script>

<!-- TODO add onClick handler for part when we click inside part -->
<!-- <KonvaGroup onclick={(e) => PlanningStageState.onClickEntity(e, part)}> -->
<KonvaGroup>
    {@render children()}
</KonvaGroup>
