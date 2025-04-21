import { Helper, parseString } from 'dxf';
import type { Arc as DxfArc, Circle as DxfCircle, Ellipse as DxfEllipse, LayerGroupedEntities, Line as DxfLine, LWPolyline, Point as DxfPoint, Polyline as DxfPolyline, Spline as DxfSpline, Entity as DxfEntity } from 'dxf/handlers/entities';
import { Line } from '../../geometry/line/line';
import { Arc } from '../../geometry/arc/arc';
import { Circle } from '../../geometry/circle/circle';
import { Spline } from '../../geometry/spline/spline';
import { Point } from '../../geometry/point/point';
import { Polyshape } from '../../geometry/polyshape/polyshape';
import { Drawing } from '../../domain/drawing/drawing/drawing';
import { Ellipse } from '../../geometry/ellipse/ellipse';
import { dxfArcToArcData, dxfCircleToCircleData, dxfEllipseToEllipseData, dxfEntityTransformToTransformData, dxfLineToLineData, dxfMeasurementToPx, dxfPointsToPolyshapeData, dxfPointToPointData, dxfSplineToSplineData } from './dxf.function';
import type { TransformData } from "$lib/geometry/transform/transform.data";
import { Layer } from '$lib/domain/drawing/layer/layer';
import type InsertEntityData from 'dxf/handlers/entity/insert';

export class DXFConverter {

    public static convertDxfToDrawing(dxfContent: string): Drawing {

        // const o = parseString(dxfContent);
        // o.header.
        //     $ANGBASE
        //     50
        //     0.0
        //     9
        //    $ANGDIR
        //     70
        //     1
        //     9

        const helper = new Helper(dxfContent);

        // TODO scale all measurements to screen pixels with dxfMeasurementToPxFactor
        // const dxfMeasurementToPxFactor = dxfMeasurementToPx(helper.parsed?.header.$INSUNITS);

        const dxfLayers = helper.denormalised.reduce((acc: {[key: string]: DxfEntity[]}, entity: DxfEntity) => {
            const layerName = entity.layer || '0'; // Default to layer '0' if no layer specified
            if (!acc[layerName]) {
                acc[layerName] = [];
            }
            acc[layerName].push(entity);
            return acc;
        }, {});

        // Convert DXF entities to Drawing
        // helper.groups is same as helper.denormalised, just grouped by layer name
        // layers key is layer name as string; value is array of entities
        // const dxfLayers: LayerGroupedEntities = helper.groups;
        const drawing: Drawing = new Drawing();
        for (const [layerName, dxfEntities] of Object.entries(dxfLayers)) {
            const layer: Layer = new Layer();
            layer.name = layerName;
            for (const dxfEntity of dxfEntities) {

                // Build up list of transforms
                const transformDatas: TransformData[] = [];
                for (const dxfEntityTransform of dxfEntity.transforms) {
                    const transformData: TransformData = dxfEntityTransformToTransformData(dxfEntityTransform);
                    transformDatas.push(transformData);
                }

                switch (dxfEntity.type) {
                    case 'ARC':
                        console.log('Arc:', dxfEntity);
                        const dxfArc: DxfArc = dxfEntity as DxfArc;
                        const arc: Arc = new Arc(dxfArcToArcData(dxfArc));
                        transformDatas.forEach((transformData) => arc.transform(transformData));
                        layer.add(arc);
                        break;
                    case 'CIRCLE':
                        console.log('Circle:', dxfEntity);
                        const dxfCircle: DxfCircle = dxfEntity;
                        const circle: Circle = new Circle(dxfCircleToCircleData(dxfCircle));
                        transformDatas.forEach((transformData) => circle.transform(transformData));
                        layer.add(circle);
                        break;
                    case 'ELLIPSE':
                        console.log('Ellipse:', dxfEntity);
                        const dxfEllipse: DxfEllipse = dxfEntity as DxfEllipse;
                        const ellipse: Ellipse = new Ellipse(dxfEllipseToEllipseData(dxfEllipse));
                        transformDatas.forEach((transformData) => ellipse.transform(transformData));
                        layer.add(ellipse);
                        break;
                    case 'LINE':
                        console.log('Line:', dxfEntity);
                        const dxfLine: DxfLine = dxfEntity;
                        const line: Line = new Line(dxfLineToLineData(dxfLine));
                        transformDatas.forEach((transformData) => line.transform(transformData));
                        // Validate
                        // When line.isClosed==true, throw it away since we can't do anything with it.
                        // if (line.isClosed) {
                        //     console.log('Throwing away closed line', line);
                        //     break;
                        // }
                        layer.add(line);
                        break;
                    case 'LWPOLYLINE':
                        console.log('LWPolyline:', dxfEntity);
                        const dxfLwpolyline: LWPolyline = dxfEntity;
                        // Validate
                        if (dxfLwpolyline.vertices?.length < 2) {
                            console.warn('LWPOLYLINE has too few vertices. Discarding.');
                            break;
                        }
                        const lwpolyline: Polyshape = new Polyshape(dxfPointsToPolyshapeData(dxfLwpolyline));
                        // Validate
                        // Throw away degenerte Polyshapes (those with no child shapes)
                        // if (lwpolyline.length == 0) {
                        //     console.log('Throwing away degenerate LWPOLYLINE', lwpolyline);
                        //     break;
                        // }
                        transformDatas.forEach((transformData) => lwpolyline.transform(transformData));
                        layer.add(lwpolyline);
                        break;
                    case 'POLYLINE':
                        console.log('Polyline:', dxfEntity);
                        const dxfPolyline: DxfPolyline = dxfEntity;
                        const polyline: Polyshape = new Polyshape(dxfPointsToPolyshapeData(dxfPolyline));
                        transformDatas.forEach((transformData) => polyline.transform(transformData));
                        layer.add(polyline);
                        break;
                    case 'POINT':
                        console.log('Point:', dxfEntity);
                        const dxfPoint: DxfPoint = dxfEntity;
                        const point: Point = new Point(dxfPointToPointData(dxfPoint));
                        transformDatas.forEach((transformData) => point.transform(transformData));
                        layer.add(point);
                        break;
                    case 'SPLINE':
                        console.log('Spline:', dxfEntity);
                        const dxfSpline: DxfSpline = dxfEntity as DxfSpline;
                        const spline: Spline = new Spline(dxfSplineToSplineData(dxfSpline));
                        transformDatas.forEach((transformData) => spline.transform(transformData));
                        layer.add(spline);
                        break;
                    default:
                        console.warn('Unknown entity type:', dxfEntity.type);
                }

            }
            // Add Layer object to Layers object
            drawing.layers.add(layer);
        }

        return drawing;
    }

    public static convertDxfToSVG(dxfContent: string): string {
        try {
            const helper = new Helper(dxfContent);
            const dxfMeasurementToPxFactor = dxfMeasurementToPx(helper.parsed?.header.$INSUNITS);
            const svg = helper.toSVG();

            // Extract viewBox values from SVG
            let [minX, minY, width, height] = [0, 0, 0, 0];
            const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
            if (viewBoxMatch) {
                [minX, minY, width, height] = viewBoxMatch[1].split(' ').map(Number);
            }

            // Ensure proper viewBox and prevent zero dimensions
            const safeWidth = Math.max(width, 1);
            const safeHeight = Math.max(height, 1);
            const viewBox = `${minX} ${minY} ${safeWidth} ${safeHeight}`;
            return svg.replace('<svg',
                `<svg viewBox="${viewBox}" style="width: ${safeWidth * dxfMeasurementToPxFactor}px; height: ${safeHeight * dxfMeasurementToPxFactor}px"`);
        } catch (error) {
            console.error('Error converting DXF to SVG:', error);
            throw new Error('Failed to convert DXF to SVG');
        }
    }
}