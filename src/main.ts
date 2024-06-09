import { makeBirdEnemy, makeFlameEnemy, makeGuyEnemy, makePlayer, setControls } from "./entities";
import { kaboomContext } from  "./kaboomCtx";
import { makeMap } from "./utils";

async function gameSetup(){
    kaboomContext.loadSprite("assets", "./kirby-like.png", {
        sliceX: 9,
        sliceY: 10,
        anims: {
             kirbyIdle: 0,
             kirbyInhaling: 1,
             kirbyFull: 2,
             kirbyInhaleEffect: { from: 3, to: 8, speed: 15, loop: true },
             shootingStar: 9,
             flame: { from: 36, to: 37, speed: 4, loop: true },
             guyIdle: 18,
             guyWalk: { from: 18, to: 19, speed: 4, loop: true },
             bird: { from: 27, to: 28, speed: 4, loop: true },
        }
    });

    const {map: level1Layout, spawnPoints: level1SpawnPoints} = await makeMap(kaboomContext, "level-1");

    kaboomContext.loadSprite("level-1", "./level-1.png");

    kaboomContext.scene("level-1", () => {
        kaboomContext.setGravity(2100);
        kaboomContext.add([
            kaboomContext.rect(kaboomContext.width(), kaboomContext.height()),
            kaboomContext.color(kaboomContext.Color.fromHex("#f7d7db")),
            kaboomContext.fixed(),
        ]);

        kaboomContext.add(level1Layout);

        const kirby = makePlayer(
            kaboomContext,
            level1SpawnPoints.player[0].x,
            level1SpawnPoints.player[0].y,
        )

        setControls(kaboomContext, kirby);
        kaboomContext.add(kirby);

        kaboomContext.camScale(kaboomContext.vec2(0.7));
        kaboomContext.onUpdate(() => {
            if (kirby.pos.x < level1Layout.pos.x + 432)
            kaboomContext.camPos(kirby.pos.x + 500, 810);
        });

        for(const flame of level1SpawnPoints.flame) {
            makeFlameEnemy(kaboomContext, flame.x, flame.y);
        };

        for(const guy of level1SpawnPoints.guy) {
            makeGuyEnemy(kaboomContext, guy.x, guy.y);
        };


        for(const bird of level1SpawnPoints.bird) {
            const possibleSpeeds = [100, 200, 300];
            kaboomContext.loop(10, () => {
                makeBirdEnemy(
                    kaboomContext,
                    bird.x,
                    bird.y,
                    possibleSpeeds[Math.floor(Math.random() * possibleSpeeds.length)]
                );
            });
        };

    });

    kaboomContext.go("level-1"); // should go to level 2
}

gameSetup();