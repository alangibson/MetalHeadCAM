<script lang="ts">
    import { browser } from '$app/environment';
    import panzoom from 'panzoom';

    let { svgContent = '' } = $props();
    let svgPanZoom: any;

    $effect(() => {
        if (svgContent) {
            const svgElement = document.querySelector('#svg-container svg');
            if (svgElement) {
                const panZoom = panzoom(svgElement, {
                    smoothScroll: false
                });
            }
        }
    });
</script>

<div id="svg-container" >
    {#if svgContent}
        {@html svgContent}
    {:else}
        <div class="placeholder">
            Upload a DXF file to view
        </div>
    {/if}
</div>