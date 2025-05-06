<script lang="ts">
    import { Circle as KonvaCircle } from "svelte-konva";
    import ShapeBearing from "../markers/ShapeBearing.svelte";
    import type { Circle } from "$lib/geometry/circle/circle";
    import { DEFAULT_COLOR_CIRCLE } from "$lib/domain/importing/config/defaults";

    let {
        geometry: circle = $bindable<Circle>(),
        stageScaleBy = $bindable(1),
        strokeWidth = $bindable(1),
        onmouseenter: onMouseEnter,
        onmouseleave: onMouseLeave,
        onclick: onClick,
    } = $props();

    // Map from CircleData to Konva.Circle
    let config = $state({
        x: circle.origin.x,
        y: circle.origin.y,
        radius: circle.radius
    });

    // Map from Konva.Circle to CircleData
    $effect(() => {
        circle.origin.x = config.x;
        circle.origin.y = config.y;
        circle.radius = config.radius;
    });
</script>

<KonvaCircle
    {...config}
    stroke={DEFAULT_COLOR_CIRCLE}
    {strokeWidth}
    lineCap="round"
    lineJoin="round"
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
    onclick={onClick}
/>

<ShapeBearing
    shape={circle}
    {strokeWidth}
></ShapeBearing>
