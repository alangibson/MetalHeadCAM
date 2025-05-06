<script lang="ts">
    import Split from "split-grid";
 
    let {
        children = null,
        leftColumn = null,
        middleColumn = null,
        rightColumn = null,
        height = $bindable(0),
        leftColumnWidth = $bindable(0),
        middleColumnWidth = $bindable(0),
        rightColumnWidth = $bindable(0)
    } = $props();

    $effect(() => {
        const gutter1 = document.querySelector(".gutter-col-1") as HTMLElement;
        const gutter3 = document.querySelector(".gutter-col-3") as HTMLElement;
        
        if (gutter1 && gutter3) {
            Split({
                columnGutters: [
                    {
                        track: 1,
                        element: gutter1,
                    },
                    {
                        track: 3,
                        element: gutter3,
                    },
                ],
            });
        }
    });

</script>

<div class="columns">
    <div class="column left-column" bind:clientWidth={leftColumnWidth}>
        {@render leftColumn?.()}
    </div>
    <div class="gutter-col gutter-col-1"></div>
    <div class="column middle-column" bind:clientHeight={height} bind:clientWidth={middleColumnWidth}>
        {@render children?.()}
        {@render middleColumn?.()}
    </div>
    <div class="gutter-col gutter-col-3"></div>
    <div class="column right-column" bind:clientWidth={rightColumnWidth}>
        {@render rightColumn?.()}
    </div>
</div>

<style>
    .columns {
        display: grid;
        grid-template-columns: 1fr 10px 6fr 10px 1fr;
        height: 100%;
        overflow: hidden;
    }

    .gutter-col {
        grid-row: 1/-1;
        cursor: col-resize;
    }

    .gutter-col-1 {
        grid-column: 2;
    }

    .gutter-col-3 {
        grid-column: 4;
    }

    .column {
        padding: 1rem;
        height: 100%;
        overflow: hidden;
    }
    .left-column {
        border-right: 2px solid #ccc;
        min-width: fit-content;
        overflow-y: auto;
        height: 100%;
    }
    .middle-column {
        display: flex;
        flex-grow: 1;
        border-right: 2px solid #ccc;
        flex-direction: column;
        justify-content: flex-start;
        padding: 0;
        gap: 1rem;
        overflow-y: auto;
        height: 100%;
    }

    .right-column {
        min-width: fit-content;
        overflow-y: auto;
        height: 100%;
    }

    .resizable {
        resize: horizontal;
        overflow: scroll;
    }

</style>
