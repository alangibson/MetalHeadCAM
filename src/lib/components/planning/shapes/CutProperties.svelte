<script lang="ts">
    import type { Cut } from "$lib/domain/planning/cut/cut";
    import { Lead } from "$lib/domain/planning/lead/lead";
    import type { LeadData } from "$lib/domain/planning/lead/lead.data";

    let { cut }: { cut: Cut } = $props();

    // Lead In
    let leadInData: LeadData = $state({
        type: "arc",
        length: 0,
    });
    let leadInChecked: boolean = $state(false);
    $effect(() => {
        if (leadInChecked) {
            if (! cut.leadIn) {
                cut.leadIn = new Lead();
            } else {
                cut.leadIn.type = leadInData.type;
                cut.leadIn.length = leadInData.length;
            }
            console.log('Lead', cut.leadIn);
        }
        // TODO Lead class is not reactive. How do we re-render Cut?
    });    
    // TODO Lead Out

</script>

<h3>Cut</h3>
<div id="cut-properties-panel">
    <h4>Properties</h4>
    <table id="cut-properties">
        <thead>
            <tr>
                <td>Name</td>
                <td>Value</td>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Id</td>
                <td>{cut.id}</td>
            </tr>
            <tr>
                <td>Orientation</td>
                <td>{cut.orientation}</td>
            </tr>
            <tr>
                <td>Start Point</td>
                <td>
                    ({cut.startPoint.x.toFixed(2)}, {cut.startPoint.y.toFixed(
                        2,
                    )})
                </td>
            </tr>
            <tr>
                <td>End Point</td>
                <td
                    >({cut.endPoint.x.toFixed(2)}, {cut.endPoint.y.toFixed(
                        2,
                    )})</td
                >
            </tr>
            <tr>
                <td>Is Closed</td>
                <td>{cut.path.isClosed}</td>
            </tr>
            <tr>
                <td>Is Simple</td>
                <td>{cut.path.isSimple}</td>
            </tr>
            <tr>
                <td>Length</td>
                <td>{cut.path.length}</td>
            </tr>
            <tr>
                <td>Area</td>
                <td>{cut.path.area}</td>
            </tr>
            <tr>
                <td> Lead In </td>
                <td>
                    <input type="checkbox" bind:checked={leadInChecked} />
                    {#if leadInChecked}
                        <table>
                            <tbody>
                                <tr>
                                    <td>Type</td>
                                    <td>{leadInData.type}</td>
                                </tr>
                                <tr>
                                    <td>Length</td>
                                    <td><input bind:value={leadInData.length} /></td
                                    >
                                </tr>
                            </tbody>
                        </table>
                    {/if}
                </td>
            </tr>
        </tbody>
    </table>
</div>

<style>
    #cut-properties {
        width: 100%;
        border-collapse: collapse;
    }

    #cut-properties td {
        padding: 0.5rem;
        border: 1px solid #ccc;
    }

    #cut-properties thead td {
        font-weight: bold;
        background-color: #f5f5f5;
    }

    #cut-properties tbody tr:nth-child(even) {
        background-color: #f9f9f9;
    }
</style>
