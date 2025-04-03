<script lang="ts">
    import type { QuadraticCurveData } from "$lib/geometry/quadratic-curve/quadratic-curve.data";
    import { Line as KonvaLine } from "svelte-konva";

    let {
        geometry: curveData = $bindable<QuadraticCurveData>(),
        onmouseenter: onMouseEnter,
        onmouseleave: onMouseLeave,
        onclick: onClick,
    } = $props();

    // Map from QuadraticCurveData to Konva.Line (using quadratic curve)
    let config = $state({
        points: [
            curveData.startPoint.x,
            curveData.startPoint.y,
            curveData.controlPoint.x,
            curveData.controlPoint.y,
            curveData.endPoint.x,
            curveData.endPoint.y
        ],
        sceneFunc: (ctx, shape) => {
            ctx.beginPath();
            ctx.moveTo(curveData.startPoint.x, curveData.startPoint.y);
            ctx.quadraticCurveTo(
                curveData.controlPoint.x,
                curveData.controlPoint.y,
                curveData.endPoint.x,
                curveData.endPoint.y
            );
            ctx.fillStrokeShape(shape);
        }
    });

    // Map from Konva.Line to QuadraticCurveData
    $effect(() => {
        const points = config.points;
        curveData.startPoint.x = points[0];
        curveData.startPoint.y = points[1];
        curveData.controlPoint.x = points[2];
        curveData.controlPoint.y = points[3];
        curveData.endPoint.x = points[4];
        curveData.endPoint.y = points[5];
    });
</script>

<KonvaLine
    {...config}
    stroke="darkblue"
    strokeWidth={1}
    lineCap="round"
    lineJoin="round"
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
    onclick={onClick}
/> 