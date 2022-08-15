# Runtypes example
For a simple comparision with a more known (and used) library,
we ported the example of [Runtypes](https://github.com/pelotom/runtypes/tree/master/examples/src).

With this generate the output:

```console
 $ therefore -d examples/runtypes/
scanning examples/runtypes/game.schema.ts
 - found Asteroid
 - found Planet
 - found Rank
 - found CrewMember
 - found Ship
 - found Fleet
 - found SpaceObject
scanning examples/runtypes/shapes.schema.ts
 - found Square
 - found Rectangle
 - found Circle
 - found Shape
 $ node_modules/.bin/prettier --write examples/runtypes/game.type.ts examples/runtypes/schemas/asteroid.schema.json examples/runtypes/schemas/planet.schema.json examples/runtypes/schemas/crew-member.schema.json examples/runtypes/schemas/ship.schema.json examples/runtypes/schemas/fleet.schema.json examples/runtypes/schemas/space-object.schema.json examples/runtypes/shapes.type.ts examples/runtypes/schemas/square.schema.json examples/runtypes/schemas/rectangle.schema.json examples/runtypes/schemas/circle.schema.json examples/runtypes/schemas/shape.schema.json
examples/runtypes/game.type.ts 179ms
examples/runtypes/schemas/asteroid.schema.json 20ms
examples/runtypes/schemas/planet.schema.json 5ms
examples/runtypes/schemas/crew-member.schema.json 8ms
examples/runtypes/schemas/ship.schema.json 8ms
examples/runtypes/schemas/fleet.schema.json 10ms
examples/runtypes/schemas/space-object.schema.json 12ms
examples/runtypes/shapes.type.ts 22ms
examples/runtypes/schemas/square.schema.json 2ms
examples/runtypes/schemas/rectangle.schema.json 6ms
examples/runtypes/schemas/circle.schema.json 2ms
examples/runtypes/schemas/shape.schema.json 3ms
Done in 0.60s.
```