
### Geometry

Geometries are conceptualy organized in levels from most primitive to most complex.

1. Point
2. Arc, Circle, Ellipse, Line, Spline
3. Poly???


Geometry
    Point
    Shape
        Line
            Segment
            Ray
        Curve
            Ellipse
                Circle
                    Arc (closed==false)
            Spline
                Nurbs
                Quadratic
                Cubic
    Polyshape<Shape>
        Polyline<Line>
            Polygon (closed==true)
        Polycurve<Curve>

### Drawing

Drawing
    Area
    Layer
        Gui
            Geometry

### Program

Program
    Machine
        Stock
            Part
                Cut
                    Rapid
                        Line
                    Lead
                        Arc, Line
                    Path
                        Geometry

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
