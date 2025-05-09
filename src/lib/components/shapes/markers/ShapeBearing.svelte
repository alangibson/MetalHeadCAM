<script lang="ts">
    import BearingMarker from "./BearingMarker.svelte";

    let {shape, strokeWidth} = $props();
</script>

<BearingMarker
    point={shape.startPoint}
    bearing={shape.tangentAt(shape.startPoint)}
    {strokeWidth}
    strokeColor="lightgreen"
></BearingMarker>
<!-- 
<BearingMarker
    point={shape.middlePoint}
    bearing={shape.tangentAt(shape.middlePoint)}
    {strokeWidth}
    strokeColor="lightblue"
></BearingMarker>
<BearingMarker
    point={shape.endPoint}
    bearing={shape.tangentAt(shape.endPoint)}
    {strokeWidth}
    strokeColor="pink"
></BearingMarker> -->