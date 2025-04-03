<script lang="ts">
    import type { CircleData } from "$lib/geometry/circle/circle.data";
    import { Circle as KonvaCircle } from "svelte-konva";

    let {
        geometry: circleData = $bindable<CircleData>(),
        onmouseenter: onMouseEnter,
        onmouseleave: onMouseLeave,
        onclick: onClick,
    } = $props();

    // Map from CircleData to Konva.Circle
    let config = $state({
        x: circleData.origin.x,
        y: circleData.origin.y,
        radius: circleData.radius
    });

    // Map from Konva.Circle to CircleData
    $effect(() => {
        circleData.origin.x = config.x;
        circleData.origin.y = config.y;
        circleData.radius = config.radius;
    });
</script>

<KonvaCircle
    {...config}
    stroke="green"
    strokeWidth={1}
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
    onclick={onClick}
/>
