
Classes should be considered long-lived entities. They are inherently mutable.

Data interfaces should be considered value objects. They are defined by their stored values.

Inheritance
-----------

- Entity
  - Geometry
    - Point
    - Shape
      - Arc
      - Circle
      - Ellipse
      - Line
      - Spline

TODO How do composite shapes (i.e. Polyshape) fit into the heirarchy? 