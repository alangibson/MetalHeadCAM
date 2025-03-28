<script lang="ts">
    import type { Drawing } from "$lib/drawing/drawing/drawing";
    import Konva from "konva";
    import KonvaContainer from "./KonvaContainer.svelte";
    import SvgContainer from "./SvgContainer.svelte";
    import { SvelteSet } from "svelte/reactivity";

    let {
        svgContent = $bindable<string>(),
        drawing = $bindable<Drawing>(),
        // 0,0 at top-left
        konvaStagePointerX = $bindable(0),
        konvaStagePointerY = $bindable(0),
        // 0,0 at bottom-left
        stagePointerX = $bindable(0),
        stagePointerY = $bindable(0),
        // Zoom scaling factor
        scaleBy = $bindable(1.0),
        selectedKonvaShapes = $bindable<SvelteSet<Konva.Shape>>(
            new SvelteSet(),
        ),
    } = $props();

    let activeTab = $state("drawing");
</script>

<div class="drawing-container">

    <div class="tabs">
        <button
            class="tab-button"
            class:active={activeTab === "drawing"}
            onclick={() => (activeTab = "drawing")}
        >
            Drawing
        </button>
        <button
            class="tab-button"
            class:active={activeTab === "svg"}
            onclick={() => (activeTab = "svg")}
        >
            SVG
        </button>
    </div>
    
    <div class="tab-content">
        <div style="display: {activeTab === 'drawing' ? 'block' : 'none'}">
            <KonvaContainer
                {drawing}
                bind:scaleBy
                bind:konvaStagePointerX
                bind:konvaStagePointerY
                bind:stagePointerX
                bind:stagePointerY
                bind:selectedKonvaShapes
            />
        </div>

        <div style="display: {activeTab === 'svg' ? 'block' : 'none'}">
            <SvgContainer {svgContent} />
        </div>
    </div>

</div>

<style>
    .drawing-container {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    /**
     * Visualization selection tabs
     */
    .tabs {
        display: flex;
        gap: 0.5rem;
        padding: 0 1rem;
        border-bottom: 2px solid #ccc;
    }

    .tab-button {
        padding: 0.5rem 1rem;
        border: none;
        background: none;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
    }

    .tab-button.active {
        border-bottom: 2px solid #333;
    }

    .tab-content {
        flex: 1;
        overflow: auto;
        min-height: 0; /* Required for Firefox */
    }
</style>
