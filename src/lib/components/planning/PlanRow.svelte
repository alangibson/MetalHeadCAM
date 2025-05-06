<script lang="ts">
    import type { Drawing } from "$lib/domain/drawing/drawing/drawing";
    import type { Plan } from "$lib/domain/planning/plan/plan";
    import { Planning } from "$lib/domain/planning/plan/plan.service";
    import RowLayout from "../RowLayout.svelte";
    import PlanComponent from "./PlanComponent.svelte";
    import PlanItems from "./PlanItems.svelte";
    import PlanProperties from "./PlanProperties.svelte";

    let { drawing }: { drawing: Drawing } = $props();

    let plan: Plan | undefined = $derived(Planning.fromDrawing(drawing));

    let height = $state(0);
    let middleColumnWidth = $state(0);
</script>

<RowLayout bind:height={height} bind:middleColumnWidth={middleColumnWidth}>
    {#snippet leftColumn()}
        <PlanItems {plan}></PlanItems>
    {/snippet}
    {#snippet middleColumn()}
        <PlanComponent
            {plan}
            width={middleColumnWidth}
            height={height}
        ></PlanComponent>
    {/snippet}
    {#snippet rightColumn()}
        <PlanProperties></PlanProperties>
    {/snippet}
</RowLayout>
