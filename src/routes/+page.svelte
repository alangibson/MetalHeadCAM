<script lang="ts">
    import type { Drawing } from "$lib/domain/drawing/drawing/drawing";
    import RowLayout from "$lib/components/RowLayout.svelte";
    import DrawingPositionComponent from "$lib/components/drawing/DrawingPositionComponent.svelte";
    import DrawingLayersComponent from "$lib/components/drawing/DrawingLayersComponent.svelte";
    import DrawingComponent from "$lib/components/drawing/DrawingComponent.svelte";
    import FileOpenRow from "$lib/components/importing/FileOpenRow.svelte";
    import GeometryProperties from "$lib/components/shapes/geometry/GeometryProperties.svelte";
    import { StageEnum } from "$lib/components/gui/stage.enum";
    import ProgramComponent from "$lib/components/programming/ProgramComponent.svelte";
    import PlanRow from "$lib/components/planning/PlanRow.svelte";
    import StageBreadcrumbs from "$lib/components/StageBreadcrumbs.svelte";

    let svgContent: string = $state("");
    let drawing: Drawing = $state();

    // 1 = Project, 2 = Import, 3 = Drawing, 4 = Program
    let activeStage: StageEnum = $state(2);
</script>

<div class="canvas-container">

    <StageBreadcrumbs bind:activeStage={activeStage}></StageBreadcrumbs>

    {#if activeStage === StageEnum.Project}
        <RowLayout></RowLayout>
    {:else if activeStage === StageEnum.Import}
        <RowLayout>
            <FileOpenRow bind:svgContent bind:drawing bind:activeStage
            ></FileOpenRow>
        </RowLayout>
    {:else if activeStage === StageEnum.Drawing}
        <RowLayout>
            {#snippet leftColumn()}
                <DrawingLayersComponent bind:drawing></DrawingLayersComponent>
            {/snippet}
            {#snippet middleColumn()}
                <DrawingComponent bind:svgContent bind:drawing
                ></DrawingComponent>
            {/snippet}
            {#snippet rightColumn()}
                <DrawingPositionComponent></DrawingPositionComponent>
                <GeometryProperties></GeometryProperties>
            {/snippet}
        </RowLayout>
    {:else if activeStage === StageEnum.Planning}
        <PlanRow {drawing}></PlanRow>
    {:else if activeStage === StageEnum.Programming}
        <RowLayout>
            {#snippet middleColumn()}
                <ProgramComponent></ProgramComponent>
            {/snippet}
        </RowLayout>
    {/if}
</div>

<style>
    .canvas-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
    }
</style>
