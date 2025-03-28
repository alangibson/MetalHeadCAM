<script lang="ts">
    import type Konva from "konva";
    import { SvelteSet } from "svelte/reactivity";

    let {
        selectedKonvaShapes = $bindable<SvelteSet<Konva.Shape>>(
            new SvelteSet(),
        ),
    } = $props();

    let expandedItems = $state(new SvelteSet<number>());

    function toggleItem(index: number) {
        if (expandedItems.has(index)) {
            expandedItems.delete(index);
        } else {
            expandedItems.add(index);
        }
    }
</script>

<div>
    <h3>Selected</h3>
    <ul>
        {#each selectedKonvaShapes as konvaShape, i}
            <li>
                <div class="dropdown-header" onclick={() => toggleItem(i)}>
                    <span class="arrow">{expandedItems.has(i) ? '▼' : '▶'}</span>
                    {konvaShape.constructor.name} ({konvaShape.index})
                </div>
                <table class:expanded={expandedItems.has(i)}>
                    <tbody>
                        <tr>
                            <td>type</td>
                            <td class="value"></td>
                        </tr>
                        <tr>
                            <td>index</td>
                            <td class="value">{konvaShape.index}</td>
                        </tr>
                        <tr>
                            <td>origin point</td>
                            <td class="value"></td>
                        </tr>
                        <tr>
                            <td>rotation angle</td>
                            <td class="value"></td>
                        </tr>
                        <tr>
                            <td>start point</td>
                            <td class="value"></td>
                        </tr>
                        <tr>
                            <td>control points</td>
                            <td class="value"></td>
                        </tr>
                        <tr>
                            <td>end point</td>
                            <td class="value"></td>
                        </tr>
                        <tr>
                            <td>start angle</td>
                            <td class="value"></td>
                        </tr>
                        <tr>
                            <td>end angle</td>
                            <td class="value"></td>
                        </tr>
                        <tr>
                            <td>radius</td>
                            <td class="value"></td>
                        </tr>
                        <tr>
                            <td>major radius</td>
                            <td class="value"></td>
                        </tr>
                        <tr>
                            <td>minor radius</td>
                            <td class="value"></td>
                        </tr>
                    </tbody>
                </table>
            </li>
        {/each}
    </ul>
</div>

<style>
    .dropdown-header {
        cursor: pointer;
        padding: 4px;
        user-select: none;
    }

    .dropdown-header:hover {
        background: #f0f0f0;
    }

    .arrow {
        display: inline-block;
        width: 16px;
    }

    table {
        display: none;
        margin-left: 16px;
    }

    table.expanded {
        display: table;
    }

    table td.value {
        border: 1px solid black;
    }

    ul {
        padding-inline-start: 0;
    }

    li {
        padding: 0;
        list-style-type: none;
    }
</style>