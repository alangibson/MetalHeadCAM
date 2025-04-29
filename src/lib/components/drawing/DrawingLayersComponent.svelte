<script lang="ts">
    import type { Drawing } from "$lib/domain/drawing/drawing/drawing";
    import type { Layer } from "$lib/domain/drawing/layer/layer";
    import type { Shape } from "$lib/geometry/shape/shape";

    let { drawing = $bindable<Drawing>() } = $props();

    // Track expanded state of layers
    let expandedLayers = $state<Set<Layer>>(new Set());
    
    function toggleLayer(layer: Layer) {
        if (expandedLayers.has(layer)) {
            expandedLayers.delete(layer);
        } else {
            expandedLayers.add(layer);
        }
    }

    // Get display name for geometry type
    function getGeometryName(geometry: Shape): string {
        return geometry.constructor.name;
    }
</script>

<div class="layers-panel">
    <h3>Layers</h3>
    <div class="layer-count">Total Layers: {drawing?.layers?.length}</div>
    <ul class="layer-list">
        {#each drawing?.layers as layer}
            <li>
                <div class="layer-header" on:click={() => toggleLayer(layer)}>
                    <span class="expand-icon">{expandedLayers.has(layer) ? '▼' : '▶'}</span>
                    <span class="layer-name">{layer.name}</span>
                    <span class="geometry-count">({layer.geometries.length})</span>
                </div>
                <ul class="geometry-list" class:expanded={true}>
                    {#each layer.geometries as geometry}
                        <li class="geometry-item">
                            <span class="geometry-type">{getGeometryName(geometry)}</span>
                        </li>
                    {/each}
                </ul>
            </li>
        {/each}
    </ul>
</div>

<style>
    .layers-panel {
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 4px;
    }

    h3 {
        margin-top: 0;
        margin-bottom: 1rem;
    }

    .layer-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .layer-header {
        display: flex;
        align-items: center;
        padding: 0.5rem;
        cursor: pointer;
        user-select: none;
        background: #fff;
        border-radius: 4px;
        margin-bottom: 0.25rem;
    }

    .layer-header:hover {
        background: #eee;
    }

    .expand-icon {
        margin-right: 0.5rem;
        font-size: 0.8em;
    }

    .layer-name {
        flex: 1;
    }

    .layer-count {
        margin-bottom: 1rem;
        color: #666;
        font-size: 0.9em;
    }

    .geometry-count {
        color: #666;
        font-size: 0.8em;
        margin-left: 0.5rem;
    }

    .geometry-list {
        list-style: none;
        padding-left: 2rem;
        margin: 0.25rem 0;
        display: none;
    }

    .geometry-list.expanded {
        display: block;
    }

    .geometry-item {
        padding: 0.25rem 0.5rem;
        font-size: 0.9em;
        color: #666;
    }

    .geometry-type {
        background: #e9ecef;
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
        font-family: monospace;
    }
</style>

