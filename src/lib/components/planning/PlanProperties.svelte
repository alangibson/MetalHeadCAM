<script lang="ts">
    import { Cut } from "$lib/domain/planning/cut/cut";
    import { Part } from "$lib/domain/planning/part/part";
    import CutProperties from "./shapes/CutProperties.svelte";
    import { PlanningStageState } from './state.svelte';

    PlanningStageState.selectedEntities

</script>

{#each PlanningStageState.selectedEntities as entity}
    {#if entity instanceof Part}
        TODO Add PartProperties
    {:else if entity instanceof Cut}
        <CutProperties cut={entity}>
        </CutProperties>
    {/if}
{/each}

