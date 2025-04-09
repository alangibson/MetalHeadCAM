<script lang="ts">
    let {
        // 0,0 at top-left
        konvaStagePointerX = $bindable(0),
        konvaStagePointerY = $bindable(0),
        // 0,0 at bottom-left
        stagePointerX = $bindable(0),
        stagePointerY = $bindable(0),
        // Zoom scaling factor
        zoomBy = $bindable(1.0)
    } = $props();

    // Runtime properties
    // 0,0 at top-left
    // let konvaStagePointerX = $state(0);
    // let konvaStagePointerY = $state(0);
    // 0,0 at bottom-left
    // let stagePointerX = $state(0);
    // let stagePointerY = $state(0);
    // Zoom scaling factor
    // let zoomBy = $state(1.0);
</script>

<div>Stage</div>
<div>
    Pos: X={konvaStagePointerX.toFixed(1)} Y={konvaStagePointerY.toFixed(1)}
</div>
<div>Zoom: {Math.round(zoomBy * 100)}% ({zoomBy})</div>
<div>Drawing</div>
<div>
    Pos: X={stagePointerX.toFixed(1)} Y={stagePointerY.toFixed(1)}
</div>
