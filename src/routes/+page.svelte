<script lang="ts">
    import type { Drawing } from "$lib/domain/drawing/drawing/drawing";
    import type Konva from "konva";
    import { SvelteSet } from "svelte/reactivity";
    import RowLayout from "$lib/components/RowLayout.svelte";
    import DrawingPositionComponent from "$lib/components/drawing/DrawingPositionComponent.svelte";
    import SelectedShapesComponent from "$lib/components/drawing/SelectedShapesComponent.svelte";
    import DrawingLayersComponent from "$lib/components/drawing/DrawingLayersComponent.svelte";
    import DrawingComponent from "$lib/components/drawing/DrawingComponent.svelte";
    import FileOpenRow from "$lib/components/importing/FileOpenRow.svelte";
    import OperationsComponent from "$lib/components/planning/OperationsComponent.svelte";
    import PlanComponent from "$lib/components/planning/PlanComponent.svelte";
    import PlanItems from "$lib/components/planning/PlanItems.svelte";
    import type { Plan } from "$lib/domain/planning/plan/plan";
    import { Planning } from "$lib/domain/planning/plan/plan.service";

    let svgContent: string = $state("");
    let drawing: Drawing = $state();
    let plan: Plan | undefined = $derived(Planning.fromDrawing(drawing));

    // 1 = Project, 2 = Import, 3 = Drawing, 4 = Program
    let activeStage = $state(2);

</script>

<div class="canvas-container">
    {#if activeStage === 1}
        <RowLayout bind:activeStage></RowLayout>
    {:else if activeStage === 2}
        <RowLayout bind:activeStage>
            <FileOpenRow bind:svgContent bind:drawing bind:activeStage
            ></FileOpenRow>
        </RowLayout>
    {:else if activeStage === 3}
        <RowLayout bind:activeStage>
            {#snippet leftColumn()}
                <DrawingLayersComponent bind:drawing></DrawingLayersComponent>
            {/snippet}
            {#snippet middleColumn()}
                <DrawingComponent bind:svgContent bind:drawing
                ></DrawingComponent>
            {/snippet}
            {#snippet rightColumn()}
                <DrawingPositionComponent></DrawingPositionComponent>
                <SelectedShapesComponent></SelectedShapesComponent>
            {/snippet}
        </RowLayout>
    {:else if activeStage === 4}
        <RowLayout bind:activeStage>
            {#snippet leftColumn()}
                <OperationsComponent></OperationsComponent>
                <PlanItems {plan}></PlanItems>
            {/snippet}
            {#snippet middleColumn()}
                <PlanComponent {plan}></PlanComponent>
            {/snippet}
            {#snippet rightColumn()}{/snippet}
        </RowLayout>
    {/if}
</div>

<style>
    .canvas-container {
        display: flex;
        flex-direction: column;
    }
    /* .canvas-container {
        height: 100%;
        overflow: hidden;
    } */

    /* .resizer {
        width: 8px;
        background: #f0f0f0;
        cursor: col-resize;
        margin: 0 -4px;
        z-index: 100;
    }
    .resizer:hover {
        background: #ccc;
    } */

    /* :global(.middle-column svg) {
        width: 100%;
        height: 100%;
        display: block;
    } */
</style>
