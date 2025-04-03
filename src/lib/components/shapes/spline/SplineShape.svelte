<script lang="ts">
    import type { SplineData } from "$lib/geometry/spline/spline.data";
    import { Line as KonvaLine } from "svelte-konva";

    let {
        geometry: splineData = $bindable<SplineData>(),
        onmouseenter: onMouseEnter,
        onmouseleave: onMouseLeave,
        onclick: onClick,
    } = $props();

    // Map from SplineData to Konva.Line points array
    let config = $state({
        points: splineData.controlPoints.flatMap(point => [point.x, point.y]),
        tension: 0.5,
        bezier: true
    });

    // Map from Konva.Line to SplineData
    $effect(() => {
        const points = config.points;
        for (let i = 0; i < points.length; i += 2) {
            const pointIndex = Math.floor(i / 2);
            if (pointIndex < splineData.controlPoints.length) {
                splineData.controlPoints[pointIndex].x = points[i];
                splineData.controlPoints[pointIndex].y = points[i + 1];
            }
        }
    });
</script>

<KonvaLine
    {...config}
    stroke="magenta"
    strokeWidth={1}
    lineCap="round"
    lineJoin="round"
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
    onclick={onClick}
/> 