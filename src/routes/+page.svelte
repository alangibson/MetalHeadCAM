<script lang="ts">
    import FileInput from "$lib/components/FileInput.svelte";
    import type { Drawing } from "$lib/drawing/drawing/drawing";
    import { DXFConverter } from "$lib/input/dxf/dxf";
    import SvgContainer from "$lib/components/SvgContainer.svelte";
    import KonvaContainer from "$lib/components/KonvaContainer.svelte";

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
    let activeTab = $state("drawing");

    // Fired after a file is opened
    function handleFileSelected(event: CustomEvent<File>) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dxfContent = e.target?.result as string;
            svgContent = DXFConverter.convertDxfToSVG(dxfContent);
            drawing = DXFConverter.convertDxfToDrawing(dxfContent);
        };
        const file = event.detail;
        reader.readAsText(file);
    }
</script>

<div class="canvas-container">
    <div class="columns">
        <div class="column left-column">
            <FileInput on:file-selected={handleFileSelected} />
        </div>
        <div class="column middle-column">
            <div class="tab-content">
                <div
                    style="display: {activeTab === 'drawing'
                        ? 'block'
                        : 'none'}"
                >
                    <KonvaContainer
                        {drawing}
                        bind:scaleBy
                        bind:konvaStagePointerX
                        bind:konvaStagePointerY
                        bind:stagePointerX
                        bind:stagePointerY
                    />
                </div>

                <div style="display: {activeTab === 'svg' ? 'block' : 'none'}">
                    <SvgContainer {svgContent} />
                </div>
            </div>

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
        </div>
        <div class="column right-column">
            <div>Stage</div>
            <div>
                Pos: X={konvaStagePointerX.toFixed(1)} Y={konvaStagePointerY.toFixed(
                    1,
                )}
            </div>
            <div>Zoom: {Math.round(scaleBy * 100)}%</div>
            <div>Drawing</div>
            <div>
                Pos: X={stagePointerX.toFixed(1)} Y={stagePointerY.toFixed(1)}
            </div>
        </div>
    </div>
</div>

<style>
    .canvas-container {
        height: 100%;
        overflow: hidden;
    }

    .columns {
        display: flex;
        overflow: hidden;
        height: 100%;
    }
    .column {
        padding: 1rem;
        overflow: auto;
    }
    .left-column {
        width: 200px;
        resize: horizontal;
        border-right: 2px solid #ccc;
    }
    .middle-column {
        flex: 1;
        width: 100%;
        resize: horizontal;
        border-right: 2px solid #ccc;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        padding: 0;
        overflow: auto;
        gap: 1rem;
    }
    .right-column {
        width: 200px;
    }
    .resizer {
        width: 8px;
        background: #f0f0f0;
        cursor: col-resize;
        margin: 0 -4px;
        z-index: 100;
    }
    .resizer:hover {
        background: #ccc;
    }
    .file-button {
        padding: 8px 16px;
        background: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .file-button:hover {
        background: #45a049;
    }

    #file-input {
        display: none;
    }

    :global(.middle-column svg) {
        width: 100%;
        height: 100%;
        display: block;
    }

    .placeholder {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        color: #666;
        font-size: 1.2em;
    }

    /**
     * Middle column tabs
     */
    .tabs {
        margin-top: auto;
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
    }
</style>
