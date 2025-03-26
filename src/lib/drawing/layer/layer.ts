import type { Gui } from "../../gui/gui";

export class LayerGui {
    
    guis: Gui[] = [];
    
    add(gui: Gui) {
        this.guis.push(gui);
    }

}