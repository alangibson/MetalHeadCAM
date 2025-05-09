<script lang="ts">
    import { Circle as KonvaCircle } from "svelte-konva";
    import type { Shape } from "$lib/geometry/shape/shape";
    import { DEFAULT_COLOR_TESSELLATE_POINT } from "$lib/domain/importing/config/defaults";
    
    let {shape}: {shape: Shape} = $props();
</script>

{#each shape.tessellate() as point}
<KonvaCircle
    x={point.x}
    y={point.y}
    radius={0.3}
    fill={DEFAULT_COLOR_TESSELLATE_POINT}
/>
{/each}
