// marche po
import Matter from "https://esm.sh/matter-js";

let started = false;

export function initPhysics(): void{


  function bindElement(elt: HTMLElement, body: Matter.Body, container: HTMLElement) {
    const { width, height } = elt.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();



    return function sync() {
      elt.style.transform = `
        translate(
          ${body.position.x - width / 2}px,
          ${body.position.y - height / 2}px
        )
        rotate(${body.angle}rad)
      `;
    };
  }

  const {
    Engine,
    World,
    Bodies,
    Mouse,
    MouseConstraint,
  } = Matter;

  const engine = Engine.create();
  engine.gravity.y = 0;

  const world = engine.world;


  function createBounds(container: HTMLElement) {
    const rect = container.getBoundingClientRect();
    const thickness = 100;

    const walls = [
      Matter.Bodies.rectangle(
        rect.width / 2,
        -thickness / 2,
        rect.width,
        thickness,
        { isStatic: true }
      ),

      // BOTTOM
      Matter.Bodies.rectangle(
        rect.width / 2,
        rect.height + thickness / 2,
        rect.width,
        thickness,
        { isStatic: true }
      ),

      // LEFT
      Matter.Bodies.rectangle(
        -thickness / 2,
        rect.height / 2,
        thickness,
        rect.height,
        { isStatic: true }
      ),

      // RIGHT
      Matter.Bodies.rectangle(
        rect.width + thickness / 2,
        rect.height / 2,
        thickness,
        rect.height,
        { isStatic: true }
      ),
    ];

    Matter.World.add(world, walls);
  }


  const syncFns: (() => void)[] = [];

  document.querySelectorAll<HTMLElement>("[data-physics]").forEach(elt => {
    const rect = elt.getBoundingClientRect();
    const container = document.getElementById("physics-zone")!;
    createBounds(container);
    const containerRect = container.getBoundingClientRect();


    const body = Bodies.rectangle(
      rect.width / 2 + Math.random() * (containerRect.width - rect.width),
      rect.height / 2 + Math.random() * (containerRect.height - rect.height),
      rect.width,
      rect.height,
      {
        restitution: 0.9,
        frictionAir: 0.03,
        sleepThreshold: Infinity,
      }
    );

    World.add(world, body);
    Matter.Body.applyForce(body, body.position, {
      x: (Math.random() - 0.5) * 0.005,
      y: (Math.random() - 0.5) * 0.005,
    });


    syncFns.push(bindElement(elt, container,  body));
    console.log(world.bodies + " feur");
  });

  (function loop() {
    Engine.update(engine, 1000 / 60);
    syncFns.forEach(fn => fn());
    requestAnimationFrame(loop);
  })();

  setInterval(() => {
    world.bodies.forEach(body => {
      Matter.Body.applyForce(body, body.position, {
        x: (Math.random() - 0.5) * 0.00002,
        y: (Math.random() - 0.5) * 0.00002,
      });
    });
  }, 1500);

  const mouse = Matter.Mouse.create(document.body);

  const mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse,
    constraint: {
      stiffness: 0.2,
      render: { visible: false },
    },
  });

  Matter.World.add(world, mouseConstraint);
}
