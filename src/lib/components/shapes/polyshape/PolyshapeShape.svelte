<script lang="ts">
    import { Path as KonvaPath } from "svelte-konva";
    import { Arc } from "$lib/geometry/arc/arc";
    import { Line } from "$lib/geometry/line/line";
    import { Polyshape } from "$lib/geometry/polyshape/polyshape";
    import { Circle } from "$lib/geometry/circle/circle";
    import { lineSvgPathCommand } from "../line/line.function";
    import { arcSvgPathCommand } from "../arc/arc.function";
    import { circleSvgPathCommand } from "../circle/circle.function";
    import { Spline } from "$lib/geometry/spline/spline";
    import { splineSvgPathCommand } from "../spline/spline.function";
    import { polyshapeSvgPathCommand } from "./polyshape.function";
    
    let {
        geometry: polyshape = $bindable<Polyshape>(),
        stageScaleBy = $bindable(1),
        strokeWidth = $bindable(1),
        onmouseenter,
        onmouseleave,
        onclick,
    } = $props();

    function buildPathData(polyshape: Polyshape): string {
        let pathData = '';
        const shapes = polyshape.shapes;

        // Start path at first point
        const firstShape = shapes[0];
        pathData += `M ${firstShape.startPoint.x} ${firstShape.startPoint.y}`;

        // Add each shape to the path
        for (const shape of shapes) {
            // TODO ellipse
            if (shape instanceof Line) {
                pathData += lineSvgPathCommand(shape);
            } else if (shape instanceof Arc) {
                pathData += arcSvgPathCommand(shape);
            } else if (shape instanceof Circle) {
                pathData += circleSvgPathCommand(shape);
            } else if (shape instanceof Spline) {
                pathData += splineSvgPathCommand(shape);
            } else if (shape instanceof Polyshape) {
                pathData += polyshapeSvgPathCommand(shape);
            } else {
                throw new Error(`Shape not supported: ${shape.type} ${shape.constructor.name}`);
            }
        }

        if (polyshape.isClosed) {
            pathData += ' Z';
        }

        return pathData;
    }

    // Map from PolyshapeData to Konva.Path
    // let config = $state({
    //     data: buildPathData(polyshape)
    // });

    let data = $derived(buildPathData(polyshape));

    // Update path data when shapes change
    // $effect(() => {
    //     // FIXME this is wrong
    //     config.data = buildPathData(polyshape);
    // });
</script>

<KonvaPath
    {data}
    stroke="brown"
    {strokeWidth}
    lineCap="round"
    lineJoin="round"
    {onclick}
    {onmouseenter}
    {onmouseleave}
/> 