<script lang="ts">
    import type Konva from "konva";
    import { SvelteSet } from "svelte/reactivity";
    import ArcProperties from "../arc/ArcProperties.svelte";
    import CircleProperties from "../circle/CircleProperties.svelte";
    import EllipseProperties from "../ellipse/EllipseProperties.svelte";
    import LineProperties from "../line/LineProperties.svelte";
    import PolyshapeProperties from "../polyshape/PolyshapeProperties.svelte";
    import SplineProperties from "../spline/SplineProperties.svelte";

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

                <div class="expandable" class:expanded={expandedItems.has(i)}>
                    {#if konvaShape.constructor.name === "Arc"}
                        <ArcProperties {konvaShape} />
                    {:else if konvaShape.constructor.name === "Polyshape"}
                        <PolyshapeProperties {konvaShape} />
                    {:else if konvaShape.constructor.name === "Line"}
                        <LineProperties {konvaShape} />
                    {:else if konvaShape.constructor.name === "Circle"}
                        <CircleProperties {konvaShape} />
                    {:else if konvaShape.constructor.name === "Ellipse"}
                        <EllipseProperties {konvaShape} />
                    {:else if konvaShape.constructor.name === "Spline"}
                        <SplineProperties {konvaShape} />
                    {/if}
                </div>
<!-- 
                <table class:expanded={expandedItems.has(i)}>
                    <tbody>
                        <tr>
                            <td>type</td>
                            <td class="value"></td>
                        </tr>
                        <tr>
                            <td>index</td>
                            <td class="value">
                                {konvaShape.index}
                            </td>
                        </tr>
                        <tr>
                            <td>origin point x</td>
                            <td class="value">
                                <input bind:value="{originX}"/>
                            </td>
                        </tr>
                        <tr>
                            <td>origin point y</td>
                            <td class="value">
                                <input bind:value="{originY}"/>
                            </td>
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
                </table> -->
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

    div.expandable {
        display: none;
        margin-left: 16px;
    }

    div.expanded {
        display: block;
    }

    ul {
        padding-inline-start: 0;
    }

    li {
        padding: 0;
        list-style-type: none;
    }
</style>