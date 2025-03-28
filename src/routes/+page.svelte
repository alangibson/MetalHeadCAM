<script lang="ts">
    import type { Drawing } from "$lib/drawing/drawing/drawing";
    import type Konva from "konva";
    import { SvelteSet } from 'svelte/reactivity';
    import FileOpenRow from "$lib/components/FileOpenRow.svelte";
    import DrawingComponent from "$lib/components/DrawingComponent.svelte";
    import RowLayout from "$lib/components/RowLayout.svelte";
    import DrawingPositionComponent from "$lib/components/DrawingPositionComponent.svelte";
    import SelectedShapesComponent from "$lib/components/SelectedShapesComponent.svelte";

    // Shared context
    //
    // Content
    let svgContent: string = $state("");
    let drawing: Drawing = $state();
    // Runtime properties
    // 0,0 at top-left
    let konvaStagePointerX = $state(0);
    let konvaStagePointerY = $state(0);
    // 0,0 at bottom-left
    let stagePointerX = $state(0);
    let stagePointerY = $state(0);
    // Zoom scaling factor
    let scaleBy = $state(1.0);
    // let activeTab = $state("drawing");
    // 1 = Project, 2 = Import, 3 = Drawing, 4 = Program
    let activeStage = $state(2);
    // Shapes that are currently selected
    let selectedKonvaShapes = $state<SvelteSet<Konva.Shape>>(new SvelteSet());
</script>

<div class="canvas-container">
    {#if activeStage === 1}
        <RowLayout bind:activeStage></RowLayout>
    {:else if activeStage === 2}
        <RowLayout bind:activeStage>
            <FileOpenRow bind:svgContent bind:drawing bind:activeStage></FileOpenRow>
        </RowLayout>
    {:else if activeStage === 3}
        <RowLayout bind:activeStage>
            {#snippet middleColumn()}
                <DrawingComponent
                    bind:svgContent
                    bind:drawing
                    bind:scaleBy
                    bind:konvaStagePointerX
                    bind:konvaStagePointerY
                    bind:stagePointerX
                    bind:stagePointerY
                    bind:selectedKonvaShapes
                ></DrawingComponent>
            {/snippet}
            {#snippet rightColumn()}
                <DrawingPositionComponent
                    bind:scaleBy
                    bind:konvaStagePointerX
                    bind:konvaStagePointerY
                    bind:stagePointerX
                    bind:stagePointerY
                ></DrawingPositionComponent>
                <SelectedShapesComponent bind:selectedKonvaShapes></SelectedShapesComponent>
            {/snippet}
        </RowLayout>
    {:else if activeStage === 4}
        <RowLayout bind:activeStage></RowLayout>
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
