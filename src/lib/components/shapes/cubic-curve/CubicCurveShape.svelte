<script lang="ts">
    import type { CubicCurveData } from "$lib/geometry/cubic-curve/cubic-curve.data";
    import { Line as KonvaLine } from "svelte-konva";

    let {
        geometry: curveData = $bindable<CubicCurveData>(),
        stageScaleBy = $bindable(1),
        strokeWidth = $bindable(1),
        onmouseenter: onMouseEnter,
        onmouseleave: onMouseLeave,
        onclick: onClick,
    } = $props();

    // Map from CubicCurveData to Konva.Line (using bezier curve)
    let config = $state({
        points: [
            curveData.startPoint.x,
            curveData.startPoint.y,
            curveData.control1Point.x,
            curveData.control1Point.y,
            curveData.control2Point.x,
            curveData.control2Point.y,
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
        curveData.control1Point.x = points[2];
        curveData.control1Point.y = points[3];
        curveData.control2Point.x = points[4];
        curveData.control2Point.y = points[5];
        curveData.endPoint.x = points[6];
        curveData.endPoint.y = points[7];
    });
</script>

<KonvaLine
    {...config}
    stroke="lightblue"
    {strokeWidth}
    lineCap="round"
    lineJoin="round"
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
    onclick={onClick}
/> 