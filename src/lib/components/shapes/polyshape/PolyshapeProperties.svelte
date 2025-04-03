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
            <td class="value">Polyshape</td>
        </tr>
        <tr>
            <td>index</td>
            <td class="value">
                {konvaShape.index}
            </td>
        </tr>
        {#each points as point, i}
            <tr>
                <td>
                    {Math.floor(i/2) % 2 === 0 ? 'start' : 'end'} point 
                    {i % 2 === 0 ? 'x' : 'y'} 
                    {Math.floor(i/4)}
                </td>
                <td class="value">
                    <input type="number" bind:value={points[i]}/>
                </td>
            </tr>
        {/each}
    </tbody>
</table> 