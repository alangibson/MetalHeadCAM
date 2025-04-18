<script lang="ts">
    import Split from "split-grid";

    let {
        children = null,
        leftColumn = null,
        middleColumn = null,
        rightColumn = null,
        activeStage = $bindable(),
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

<div class="breadcrumbs">
    <div
        class="breadcrumb"
        class:active={activeStage > 1}
        class:selected={activeStage === 1}
    >
        <button onclick={() => activeStage = 1}>Project</button>
        <span class="chevron">›</span>
    </div>
    <div
        class="breadcrumb"
        class:active={activeStage > 2}
        class:selected={activeStage === 2}
    >
        <button onclick={() => activeStage = 2}>Import</button>
        <span class="chevron">›</span>
    </div>
    <div
        class="breadcrumb"
        class:active={activeStage > 3}
        class:selected={activeStage === 3}
    >
        <button onclick={() => activeStage = 3}>Drawing</button>
        <span class="chevron">›</span>
    </div>
    <div
        class="breadcrumb"
        class:active={activeStage > 4}
        class:selected={activeStage === 4}
    >
        <button onclick={() => activeStage = 4}>Program</button>
    </div>
</div>

<div class="columns">
    <div class="column left-column">
        {@render leftColumn?.()}
    </div>
    <div class="gutter-col gutter-col-1"></div>
    <div class="column middle-column">
        {@render children?.()}
        {@render middleColumn?.()}
    </div>
    <div class="gutter-col gutter-col-3"></div>
    <div class="column right-column">
        {@render rightColumn?.()}
    </div>
</div>

<style>
    /* .columns {
        display: flex;
        overflow: hidden;
        height: 100%;
    } */

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

    /**
     * Breadrcumbs
     */
    .breadcrumbs {
        display: flex;
        width: 100%;
        padding: 1rem;
        gap: 0.5rem;
        border-bottom: 2px solid #ccc;
    }

    .breadcrumb {
        display: flex;
        align-items: center;
        color: #666;
        font-size: 0.9rem;
        gap: 0.5rem;
    }

    .breadcrumb button {
        border: none;
        background: none;
        cursor: pointer;
    }

    .breadcrumb.active {
        color: #4caf50;
        font-weight: 500;
        border-bottom: 1px solid #4caf50;
    }

    .breadcrumb.selected {
        color: blue;
        font-weight: 500;
        border-bottom: 1px solid blue;
    }

    .chevron {
        color: #999;
        font-size: 1.2rem;
        line-height: 1;
    }
</style>
