import { AreaComp, BodyComp, DoubleJumpComp, GameObj, HealthComp, KaboomCtx, OpacityComp, PosComp, ScaleComp, SpriteComp } from "kaboom";
import { scale } from "./constants";

type PlayerGameObj = GameObj<
    SpriteComp &
    AreaComp &
    BodyComp &
    PosComp &
    ScaleComp &
    DoubleJumpComp &
    HealthComp &
    OpacityComp & {
        speed: number;
        direction: string;
        isInhaling: boolean;
        isFull: boolean;
    }
>;


export function makePlayer(kaboomContext: KaboomCtx, posX: number, posY: number){

    const player = kaboomContext.make([
        kaboomContext.sprite("assets", {anim: "kirbyIdle" }),
        kaboomContext.area({ shape: new kaboomContext.Rect(kaboomContext.vec2(4, 5.9), 8, 10) }),
        kaboomContext.body(),
        kaboomContext.pos(posX * scale, posY * scale),
        kaboomContext.scale(scale),
        kaboomContext.doubleJump(10),
        kaboomContext.health(3),
        kaboomContext.opacity(1),
        {
            speed: 300,
            direction: "right",
            isInhaling: false,
            isFull: false,
        },
        "player",
    ]);

    player.onCollide("enemy", async (enemy : GameObj) => {
        if (player.isInhaling && enemy.isInhalable) {
            player.isInhaling = false;
            kaboomContext.destroy(enemy);
            player.isFull = true;
            return;
        }

        if (player.hp() === 0) {
            kaboomContext.destroy(player);
            kaboomContext.go("level-1");
            return;
        }

        player.hurt();

        await kaboomContext.tween(
            player.opacity,
            0,
            0.05,
            (val) => (player.opacity = val),
            kaboomContext.easings.linear
        );
        await kaboomContext.tween(
            player.opacity,
            1,
            0.05,
            (val) => (player.opacity = val),
            kaboomContext.easings.linear
        );
    });

    player.onCollide("exit", () => {
        kaboomContext.go("level-1");
    });

    const inhaleEffect = kaboomContext.add([
        kaboomContext.sprite("assets", { anim: "kirbyInhaleEffect"}),
        kaboomContext.pos(),
        kaboomContext.scale(scale),
        kaboomContext.opacity(0),
        "inhaleEffect",
    ]);

    const inhaleZone = player.add([
        kaboomContext.area({ shape: new kaboomContext.Rect(kaboomContext.vec2(0), 20, 4) }),
        kaboomContext.pos(),
        "inhaleZone",
    ]);

    inhaleZone.onUpdate(() => {
        if (player.direction === "left") {
            inhaleZone.pos = kaboomContext.vec2(-14, 8);
            inhaleEffect.pos = kaboomContext.vec2(player.pos.x - 60, player.pos.y);
            inhaleEffect.flipX = true;
            return;
        }
        inhaleZone.pos = kaboomContext.vec2(14, 8);
        inhaleEffect.pos = kaboomContext.vec2(player.pos.x + 64, player.pos.y);
        inhaleEffect.flipX = false;
    });

    player.onUpdate(() => {
        if (player.pos.y > 2000) {
            kaboomContext.go("level-1");
        }
    });

    return player;

}

export function setControls(kaboomContext: KaboomCtx, player: PlayerGameObj) {

    const inhaleEffectRef = kaboomContext.get("inhaleEffect")[0];

    kaboomContext.onKeyDown((key) => {
        switch (key) {
            case "left":
                player.direction = "left";
                player.flipX = true;
                player.move(-player.speed, 0);
                break;
            case "right":
                player.direction = "right";
                player.flipX = false;
                player.move(player.speed, 0);
                break;
            case "z":
                if (player.isFull) {
                    player.play("kirbyFull");
                    inhaleEffectRef.opacity = 0;
                    break;
                }

                player.isInhaling = true;
                player.play("kirbyInhaling");
                inhaleEffectRef.opacity = 1;
                break;
            default:
        }
    });

    kaboomContext.onKeyPress((key) => {
        if (key === "x") player.doubleJump();
    });

    kaboomContext.onKeyRelease((key) => {
        if (key === "z") {
            if (player.isFull) {
                player.play("kirbyInhaling");
                const shootingStar = kaboomContext.add([
                    kaboomContext.sprite("assets", {
                        anim: "shootingStar",
                        flipX: player.direction === "right",
                    }),
                    kaboomContext.area({ shape: new kaboomContext.Rect(kaboomContext.vec2(5, 4), 6, 6) }),
                    kaboomContext.pos(
                        player.direction === "left" ? player.pos.x - 80 : player.pos.x + 80,
                        player.pos.y + 5,
                    ),
                    kaboomContext.scale(scale),
                    player.direction === "left" ? kaboomContext.move(kaboomContext.LEFT, 800) : kaboomContext.move(kaboomContext.RIGHT, 800),
                    "shootingStar",
                ]);
                shootingStar.onCollide("platform", () => kaboomContext.destroy(shootingStar));

                player.isFull = false;
                kaboomContext.wait(1, () => player.play("kirbyIdle"));
                return;
            }

            inhaleEffectRef.opacity = 0;
            player.isInhaling = false;
            player.play("kirbyIdle");
        }
    });

}

export function makeInhalable(kaboomContext: KaboomCtx, enemy: GameObj) {
    enemy.onCollide("inhaleZone", () => {
        enemy.isInhalable = true;
    });

    enemy.onCollideEnd("inhaleZone", () => {
        enemy.isInhalable = false;
    });

    enemy.onCollide("shootingStar", (shootingStar: GameObj) => {
        kaboomContext.destroy(enemy);
        kaboomContext.destroy(shootingStar);
    });

    const playerRef = kaboomContext.get("player")[0];
    enemy.onUpdate(() => {
        if (playerRef.isInhaling && enemy.isInhalable) {
            if (playerRef.direction === "right") {
                enemy.move(-800, 0);
                return;
            }
            enemy.move(800, 0);
        };
    });
}

export function makeFlameEnemy(kaboomContext: KaboomCtx, posX: number, posY: number) {
    const flame = kaboomContext.add([
        kaboomContext.sprite("assets",
        {
            anim: "flame"
        }),
        kaboomContext.scale(scale),
        kaboomContext.pos(posX * scale, posY * scale),
        kaboomContext.area({
            shape: new kaboomContext.Rect(kaboomContext.vec2(4, 6), 8, 10),
            collisionIgnore: ["enemy"],
        }),
        kaboomContext.body(),
        kaboomContext.state("idle", ["idle", "jump"]),
        {
            isInhalable: false,
        },
        "enemy",
    ]);

    makeInhalable(kaboomContext, flame);

    flame.onStateEnter("idle", async () => {
        await kaboomContext.wait(1);
        flame.enterState("jump");
    });

    flame.onStateEnter("jump", async () => {
        flame.jump(1000);
    });

    flame.onStateUpdate("jump", async () => {
        if (flame.isGrounded()) {
            flame.enterState("idle");
        }
    });

    return flame;
}

export function makeGuyEnemy(kaboomContext: KaboomCtx, posX: number, posY: number) {
    const guy = kaboomContext.add([
        kaboomContext.sprite("assets", { anim: "guyWalk"}),
        kaboomContext.scale(scale),
        kaboomContext.pos(posX * scale, posY * scale),
        kaboomContext.area({
            shape: new kaboomContext.Rect(kaboomContext.vec2(2, 3.9), 12, 12),
            collisionIgnore: ["enemy"],
        }),
        kaboomContext.body(),
        kaboomContext.state("idle", ["idle", "left", "right", "jump"]),
        {
            isInhalable: false,
            speed: 100
        },
        "enemy"
    ]);

    makeInhalable(kaboomContext, guy);

    guy.onStateEnter("idle", async () => {
        await kaboomContext.wait(1),
        guy.enterState("left");
    });

    guy.onStateEnter("left", async () => {
        await kaboomContext.wait(2),
        guy.flipX = false;
        guy.enterState("right");
    });

    guy.onStateUpdate("left", () => {
        guy.move(-guy.speed, 0);
    });

    guy.onStateEnter("right", async () => {
        await kaboomContext.wait(2);
        guy.flipX = true;
        guy.enterState("left");
    });

    guy.onStateUpdate("right", () => {
        guy.move(guy.speed, 0);
    });

    // to-do: jump state

    return guy;
}

export function makeBirdEnemy(kaboomContext: KaboomCtx, posX: number, posY: number, speed: number) {
    const bird = kaboomContext.add([
        kaboomContext.sprite("assets", { anim: "bird"}),
        kaboomContext.scale(scale),
        kaboomContext.pos(posX * scale, posY * scale),
        kaboomContext.area({
            shape: new kaboomContext.Rect(kaboomContext.vec2(4, 6), 8, 10),
            collisionIgnore: ["enemy"],
        }),
        kaboomContext.body({ isStatic: true }),
        kaboomContext.move(kaboomContext.LEFT, speed),
        kaboomContext.offscreen({ 
            destroy: true,
            distance: 400,
        }),
        "enemy"
    ]);

    makeInhalable(kaboomContext, bird);

    return bird;
}