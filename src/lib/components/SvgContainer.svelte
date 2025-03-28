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
        <svg/>
    {/if}
</div>

<style>

    #svg-container {
        height: 100%;
    }

    #svg-container svg {
        width: 100%;
        height: 100%;
        display: block;
    }

</style>