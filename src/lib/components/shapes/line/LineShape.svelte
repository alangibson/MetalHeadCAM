<script lang="ts">
    import type { LineData } from "$lib/geometry/line/line.data";
    import { Line as KonvaLine } from "svelte-konva";

    let {
        geometry: lineData = $bindable<LineData>(),
        onmouseenter: onMouseEnter,
        onmouseleave: onMouseLeave,
        onclick: onClick,
    } = $props();

    // Map from LineData to Konva.Line
    let config = $state({
        points: [
            lineData.startPoint.x,
            lineData.startPoint.y,
            lineData.endPoint.x,
            lineData.endPoint.y
        ]
    });

    // Map from Konva.Line to LineData
    $effect(() => {
        const points = config.points;
        lineData.startPoint.x = points[0];
        lineData.startPoint.y = points[1];
        lineData.endPoint.x = points[2];
        lineData.endPoint.y = points[3];
    });
</script>

<KonvaLine
    {...config}
    stroke="orange"
    strokeWidth={1}
    lineCap="round"
    lineJoin="round"
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
    onclick={onClick}
/> 