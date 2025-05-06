import type { LeadData } from "./lead.data";

export class Lead implements LeadData {
    type: string;
    length: number;
 
    constructor(data: LeadData) {
        this.type = data.type;
        this.length = data.length;
    }
    
}