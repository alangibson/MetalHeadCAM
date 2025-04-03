<script lang="ts">
    import type Konva from "konva";

    let {
        konvaShape
    }: { konvaShape: Konva.Line } = $props();

    // This block makes the Konva shape reactive
    let points = $state<number[]>(konvaShape.points());

    $effect(() => {
        konvaShape.points(points);
        konvaShape.fire('transformend');
        konvaShape.fire('dragend');
    });
</script>

<table>
    <tbody>
        <tr>
            <td>type</td>
            <td class="value">Line</td>
        </tr>
        <tr>
            <td>index</td>
            <td class="value">
                {konvaShape.index}
            </td>
        </tr>
        <tr>
            <td>start point x</td>
            <td class="value">
                <input type="number" bind:value={points[0]}/>
            </td>
        </tr>
        <tr>
            <td>start point y</td>
            <td class="value">
                <input type="number" bind:value={points[1]}/>
            </td>
        </tr>
        <tr>
            <td>end point x</td>
            <td class="value">
                <input type="number" bind:value={points[2]}/>
            </td>
        </tr>
        <tr>
            <td>end point y</td>
            <td class="value">
                <input type="number" bind:value={points[3]}/>
            </td>
        </tr>
    </tbody>
</table> 