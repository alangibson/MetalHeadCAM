<script lang="ts">
    import type { CubicCurveData } from "$lib/geometry/cubic-curve/cubic-curve.data";
    import { Line as KonvaLine } from "svelte-konva";

    let {
        geometry: curveData = $bindable<CubicCurveData>(),
        onmouseenter: onMouseEnter,
        onmouseleave: onMouseLeave,
        onclick: onClick,
    } = $props();

    // Map from CubicCurveData to Konva.Line (using bezier curve)
    let config = $state({
        points: [
            curveData.startPoint.x,
            curveData.startPoint.y,
            curveData.controlPoint1.x,
            curveData.controlPoint1.y,
            curveData.controlPoint2.x,
            curveData.controlPoint2.y,
            curveData.endPoint.x,
            curveData.endPoint.y
        ],
        bezier: true
    });

    // Map from Konva.Line to CubicCurveData
    $effect(() => {
        const points = config.points;
        curveData.startPoint.x = points[0];
        curveData.startPoint.y = points[1];
        curveData.controlPoint1.x = points[2];
        curveData.controlPoint1.y = points[3];
        curveData.controlPoint2.x = points[4];
        curveData.controlPoint2.y = points[5];
        curveData.endPoint.x = points[6];
        curveData.endPoint.y = points[7];
    });
</script>

<KonvaLine
    {...config}
    stroke="lightblue"
    strokeWidth={1}
    lineCap="round"
    lineJoin="round"
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
    onclick={onClick}
/> 