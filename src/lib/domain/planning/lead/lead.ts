import type { Arc } from "$lib/geometry/arc/arc";
import type { Line } from "$lib/geometry/line/line";
import type { PointData } from "$lib/geometry/point/point.data";
import type { Shape } from "$lib/geometry/shape/shape";
import type { TransformData } from "$lib/geometry/transform/transform.data";
import type { LeadData } from "./lead.data";
import { LeadTypeEnum } from "./lead.enum";
import type { LeadShape } from "./lead.type";

export class Lead implements LeadData {
    type: string;
    length: number;
    endPoint: PointData;
    shape: LeadShape;
 
    // TODO Lead needs builder function since we have to test that it doesn't 
    // intersect any other shapes
    constructor({type, length, endPoint}: LeadData) {
        // Validate
        if (! (type == LeadTypeEnum.arc || type == LeadTypeEnum.line))
            throw new Error(`Invalid lead type: ${type}`);
        // Construct
        if (type == LeadTypeEnum.arc)
            // TODO construct Arc based on length
            this.shape = new Arc();
        else if (type == LeadTypeEnum.line)
            this.shape = new Line();
    }
    
    /** Used primarily to rotate Lead when constructing it. */
    transform(transform: TransformData): void {

    }

    /** True if Lead intersects with given Shape */
    intersects(shape: Shape): boolean {

    }

}