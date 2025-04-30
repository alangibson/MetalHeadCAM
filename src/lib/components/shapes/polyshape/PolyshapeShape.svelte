<script lang="ts">
    import { Path as KonvaPath } from "svelte-konva";
    import { Polyshape } from "$lib/geometry/polyshape/polyshape";
    import { shapeSvgPathCommand } from "../shape/shape.function";
    import ShapeBearing from "../markers/ShapeBearing.svelte";
    import ShapeTessellation from "../markers/ShapeTessellation.svelte";

    let {
        geometry: polyshape = $bindable<Polyshape>(),
        strokeWidth = $bindable(1),
        onmouseenter,
        onmouseleave,
        onclick,
    } = $props();

    function buildPathData(polyshape: Polyshape): string {
        let pathData = "";
        const shapes = polyshape.shapes;

        // Start path at first point
        const firstShape = shapes[0];
        pathData += `M ${firstShape.startPoint.x} ${firstShape.startPoint.y}`;

        // Add each shape to the path
        for (const shape of shapes) {
            pathData += shapeSvgPathCommand(shape);
        }

        return pathData;
    }

    let data = $derived(buildPathData(polyshape));
</script>

<KonvaPath
    {data}
    stroke="black"
    {strokeWidth}
    lineCap="round"
    lineJoin="round"
    {onclick}
    {onmouseenter}
    {onmouseleave}
/>
<ShapeBearing shape={polyshape} {strokeWidth}></ShapeBearing>
<!-- <ShapeTessellation shape={polyshape}></ShapeTessellation> -->