<script lang="ts">
    import { radiansToDegrees } from "$lib/geometry/angle/angle.function";
    import type { Line } from "$lib/geometry/line/line";
    import { Line as KonvaLine, Wedge as KonvaWedge } from "svelte-konva";
    import BearingMarker from "../markers/BearingMarker.svelte";
    import ShapeBearing from "../markers/ShapeBearing.svelte";

    let {
        geometry: line = $bindable<Line>(),
        stageScaleBy = $bindable(1),
        strokeWidth = $bindable(1),
        onmouseenter: onMouseEnter,
        onmouseleave: onMouseLeave,
        onclick: onClick,
    } = $props();

    // Map from LineData to Konva.Line
    let config = $state({
        points: [
            line.startPoint.x,
            line.startPoint.y,
            line.endPoint.x,
            line.endPoint.y,
        ],
    });
    let middlePoint = $derived(line.middlePoint);

    // Map from Konva.Line to LineData
    $effect(() => {
        const points = config.points;
        line.startPoint.x = points[0];
        line.startPoint.y = points[1];
        line.endPoint.x = points[2];
        line.endPoint.y = points[3];
    });
</script>

<KonvaLine
    {...config}
    stroke="orange"
    {strokeWidth}
    lineCap="round"
    lineJoin="round"
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
    onclick={onClick}
/>

<ShapeBearing
    shape={line}
    {strokeWidth}
></ShapeBearing>