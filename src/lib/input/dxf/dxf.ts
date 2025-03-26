import Konva from 'konva';
import { Helper } from 'dxf';
import type { Arc as DxfArc, Circle as DxfCircle, Ellipse as DxfEllipse, LayerGroupedEntities, Line as DxfLine, LWPolyline, Point as DxfPoint, Polyline as DxfPolyline, Spline as DxfSpline, Entity as DxfEntity} from 'dxf/handlers/entities';
import { Line } from '../../geometry/line/line';
import { Arc } from '../../geometry/arc/arc';
import { Circle } from '../../geometry/circle/circle';
import { Spline } from '../../geometry/spline/spline';
import { Point } from '../../geometry/point/point';
import { Polyshape } from '../../geometry/polyshape/polyshape';
import { ArcGui } from '../../gui/arc';
import { CircleGui } from '../../gui/circle';
import { LineGui } from '../../gui/line';
import { SplineGui } from '../../gui/spline';
import { PointGui } from '../../gui/point';
import { PolyshapeGui } from '../../gui/polyshape';
import { Drawing } from '../../drawing/drawing/drawing';
import { LayerGui } from '../../drawing/layer/layer';
import { Ellipse } from '../../geometry/ellipse/ellipse';
import { QuadraticCurve } from '../../geometry/quadratic-curve/quadratic-curve';
import { QuadraticCurveGui } from '../../gui/quadratic-curve';
import { CubicCurve } from '../../geometry/cubic-curve/cubic-curve';
import { CubicCurveGui } from '../../gui/cubic-curve';
import { EllipseGui } from '../../gui/ellipse';
import { dxfArcToArcData, dxfCircleToCircleData, dxfEllipseToEllipseData, dxfEntityTransformToTransformData, dxfLineToLineData, dxfMeasurementToPx, dxfPointsToPolyshapeData, dxfPointToPointData, dxfSplineToCubicCurveData, dxfSplineToQuadraticCurveData, dxfSplineToSplineData } from './dxf.function';
import type { TransformData } from "$lib/geometry/transform/transform.data";

export class DXFConverter {

    public static convertDxfToDrawing(dxfContent: string): Drawing {
        const helper = new Helper(dxfContent);

        // TODO scale all measurements to screen pixels with dxfMeasurementToPxFactor
        // const dxfMeasurementToPxFactor = dxfMeasurementToPx(helper.parsed?.header.$INSUNITS);

        // Convert DXF entities to Drawing
        // helper.groups is same as helper.denormalised, just grouped by layer name
        // layers key is layer name as string; value is array of entities
        const dxfLayers: LayerGroupedEntities = helper.groups;
        const drawing: Drawing = new Drawing();
        for (const [layerName, dxfEntities] of Object.entries(dxfLayers)) {
            console.log('Layer:', layerName);
            const layer: LayerGui = new LayerGui();
            for (const dxfEntity of dxfEntities) {

                // Build up list of transforms
                const transformDatas: TransformData[] = [];
                for (const dxfEntityTransform of  dxfEntity.transforms) {
                    const transformData: TransformData = dxfEntityTransformToTransformData(dxfEntityTransform);
                    transformDatas.push(transformData);
                }

                switch (dxfEntity.type) {
                    case 'ARC':
                        console.log('Arc:', dxfEntity);
                        const dxfArc: DxfArc = dxfEntity;
                        const arc: Arc = new Arc(dxfArcToArcData(dxfArc));
                        transformDatas.forEach((transformData) => arc.transform(transformData));
                        const arcGui: ArcGui = new ArcGui(arc);
                        layer.add(arcGui);
                        break;
                    case 'CIRCLE':
                        console.log('Circle:', dxfEntity);
                        const dxfCircle: DxfCircle = dxfEntity;
                        const circle: Circle = new Circle(dxfCircleToCircleData(dxfCircle));
                        transformDatas.forEach((transformData) => circle.transform(transformData));
                        const circleGui: CircleGui = new CircleGui(circle);
                        layer.add(circleGui);
                        break;
                    case 'ELLIPSE':
                        console.log('Ellipse:', dxfEntity);
                        const dxfEllipse: DxfEllipse = dxfEntity;
                        const ellipse: Ellipse = new Ellipse(dxfEllipseToEllipseData(dxfEllipse));
                        transformDatas.forEach((transformData) => ellipse.transform(transformData));
                        const ellipseGui: EllipseGui = new EllipseGui(ellipse);
                        layer.add(ellipseGui);
                        break;
                    case 'LINE':
                        console.log('Line:', dxfEntity);
                        const dxfLine: DxfLine = dxfEntity;
                        const line: Line = new Line(dxfLineToLineData(dxfLine));
                        transformDatas.forEach((transformData) => line.transform(transformData));
                        const lineGui: LineGui = new LineGui(line);
                        layer.add(lineGui);
                        break;
                    case 'LWPOLYLINE':
                        console.log('LWPolyline:', dxfEntity);
                        const dxfLwpolyline: LWPolyline = dxfEntity;
                        const lwpolyline: Polyshape = new Polyshape(dxfPointsToPolyshapeData(dxfLwpolyline));
                        transformDatas.forEach((transformData) => lwpolyline.transform(transformData));
                        const lwpolylineGui: PolyshapeGui = new PolyshapeGui(lwpolyline);
                        layer.add(lwpolylineGui);
                        break;
                    case 'POLYLINE':
                        console.log('Polyline:', dxfEntity);
                        const dxfPolyline: DxfPolyline = dxfEntity;
                        const polyline: Polyshape = new Polyshape(dxfPointsToPolyshapeData(dxfPolyline));
                        transformDatas.forEach((transformData) => polyline.transform(transformData));
                        const polylineGui: PolyshapeGui = new PolyshapeGui(polyline);
                        layer.add(polylineGui);
                        break;
                    case 'POINT':
                        console.log('Point:', dxfEntity);
                        const dxfPoint: DxfPoint = dxfEntity;
                        const point: Point = new Point(dxfPointToPointData(dxfPoint));
                        transformDatas.forEach((transformData) => point.transform(transformData));
                        const pointGui: PointGui = new PointGui(point);
                        layer.add(pointGui);
                        break;
                    case 'SPLINE':
                        console.log('Spline:', dxfEntity);
                        const dxfSpline: DxfSpline = dxfEntity;
                        if (dxfSpline.controlPoints.length === 3) {
                            const quadraticCurve: QuadraticCurve = new QuadraticCurve(dxfSplineToQuadraticCurveData(dxfSpline));
                            transformDatas.forEach((transformData) => quadraticCurve.transform(transformData));
                            const quadraticCurveGui: QuadraticCurveGui = new QuadraticCurveGui(quadraticCurve);
                            layer.add(quadraticCurveGui);
                            break;
                        } else if (dxfSpline.controlPoints.length === 4) {
                            const cubicCurve: CubicCurve = new CubicCurve(dxfSplineToCubicCurveData(dxfSpline));
                            transformDatas.forEach((transformData) => cubicCurve.transform(transformData));
                            const cubicCurveGui: CubicCurveGui = new CubicCurveGui(cubicCurve);
                            layer.add(cubicCurveGui);
                            break;
                        } else {
                            const spline: Spline = new Spline(dxfSplineToSplineData(dxfSpline));
                            transformDatas.forEach((transformData) => spline.transform(transformData));
                            const splineGui: SplineGui = new SplineGui(spline);
                            layer.add(splineGui);
                            break;
                        }
                    default:
                        console.warn('Unknown entity type:', dxfEntity.type);
                }

            }
            // Add Layer object to Layers object
            drawing.layers.add(layer);
        }

        return drawing;
    }

    public static convertDrawingToKonvaLayers(drawing: Drawing): Konva.Layer[] {
        const konvaLayers: Konva.Layer[] = [];
        for (const layer of drawing.layers) {
            const konvaLayer = new Konva.Layer();
            for (const gui of layer.guis) {
                const konvaShape: Konva.Shape = gui.toKonvaJs();
                konvaLayer.add(konvaShape);
            }
            konvaLayers.push(konvaLayer);
        }
        return konvaLayers;
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