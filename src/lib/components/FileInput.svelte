<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher<{
        'file-selected': File
    }>();

    let fileInput: HTMLInputElement;

    function handleClick() {
        fileInput.click();
    }

    function handleChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            dispatch('file-selected', file);
        }
    }
</script>

<input
    type="file"
    accept=".dxf"
    bind:this={fileInput}
    on:change={handleChange}
    style="display: none"
/>
<button class="file-button" on:click={handleClick}>
    Open Drawing
</button>

<style>
    .file-button {
        padding: 8px 16px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .file-button:hover {
        background: #45a049;
    }
</style> 