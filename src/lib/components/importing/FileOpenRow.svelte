<script lang="ts">
    import type { Drawing } from "$lib/domain/drawing/drawing/drawing";
    import { DXFConverter } from "$lib/domain/importing/dxf/dxf";
    import FileInput from "./FileInput.svelte";

    let {
        svgContent = $bindable<string>(),
        drawing = $bindable<Drawing>(),
        activeStage = $bindable(),
    } = $props();

    function handleFileSelected(event: CustomEvent<File>) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dxfContent = e.target?.result as string;
            svgContent = DXFConverter.convertDxfToSVG(dxfContent);
            drawing = DXFConverter.convertDxfToDrawing(dxfContent);

            activeStage += 1;
        };
        const file = event.detail;
        reader.readAsText(file);
    }
</script>

<FileInput on:file-selected={handleFileSelected} />
