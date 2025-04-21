<script lang="ts">
    import BearingMarker from "./BearingMarker.svelte";

    let {shape, strokeWidth} = $props();
</script>

<BearingMarker
    point={shape.startPoint}
    bearing={shape.bearingAt(shape.startPoint)}
    {strokeWidth}
    strokeColor="lightgreen"
></BearingMarker>
<BearingMarker
    point={shape.middlePoint}
    bearing={shape.bearingAt(shape.middlePoint)}
    {strokeWidth}
    strokeColor="lightblue"
></BearingMarker>
<BearingMarker
    point={shape.endPoint}
    bearing={shape.bearingAt(shape.endPoint)}
    {strokeWidth}
    strokeColor="pink"
></BearingMarker>