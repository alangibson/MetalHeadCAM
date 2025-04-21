<script lang="ts">
    import { Ellipse as KonvaEllipse } from "svelte-konva";
    import {
        degreesToRadians,
        radiansToDegrees,
    } from "$lib/geometry/angle/angle.function";
    import type { Ellipse } from "$lib/geometry/ellipse/ellipse";
    import ShapeBearing from "../markers/ShapeBearing.svelte";

    let {
        geometry: ellipse = $bindable<Ellipse>(),
        stageScaleBy = $bindable(1),
        strokeWidth = $bindable(1),
        onmouseenter: onMouseEnter,
        onmouseleave: onMouseLeave,
        onclick: onClick,
    } = $props();

    // Map from EllipseData to Konva.Ellipse
    let config = $state({
        x: ellipse.origin.x,
        y: ellipse.origin.y,
        radiusX: ellipse.majorLength,
        radiusY: ellipse.minorLength,
        rotation: radiansToDegrees(ellipse.rotation),
    });

    // Map from Konva.Ellipse to EllipseData
    $effect(() => {
        ellipse.origin.x = config.x;
        ellipse.origin.y = config.y;
        ellipse.majorLength = config.radiusX;
        ellipse.minorLength = config.radiusY;
        ellipse.rotation = degreesToRadians(config.rotation);
    });
</script>

<KonvaEllipse
    {...config}
    stroke="purple"
    {strokeWidth}
    lineCap="round"
    lineJoin="round"
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
    onclick={onClick}
/>

<ShapeBearing shape={ellipse} {strokeWidth}></ShapeBearing>
