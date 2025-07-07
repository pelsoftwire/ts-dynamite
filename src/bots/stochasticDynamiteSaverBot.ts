// if the stakes are low, just choose randomly between R,P,S
// if the stakes are high:
    // play dynamite*

// track enemy waterbomb usage. If they throw waterbomb more than x% of the time when the stakes are "high", throw a random RPS instead ..
    // .. ditto for dyanmite

type Round = {
    p1: BotSelection,
    p2: BotSelection
}

// config stuff
const HIGHSTAKETHRESHOLD : number = 3;
const MEDIUMSTAKESTHRESHOLD : number = 2;

const WATERBOMBOVERUSETHRESHOLD : number = 0.85;
const DYNAMITEBOMBOVERUSETHRESHOLD : number = 0.6;

const MEDIUMSTAKESDYNAMITETHRESHOLD : number = 0.85;

import { Gamestate, BotSelection } from '../models/gamestate';

class Bot {

    private highStakesDynamiteChance : number = 0.8;
    private highStakesWaterbombChance : number = 0.1;

    private getEnemyHighStakeUsage(gamestate: Gamestate, tracking: BotSelection, threshold: number) : number {
        let highStakesRounds : number = 0;
        let trackedUses : number = 0;
        // use getStakes to track the stakes. If the stakes of a round are high, check whether the opponent used tracked

        let rounds : Round[] = gamestate.rounds;
        for (var i = rounds.length-1; i >= 0; i--) {
            let currentRound: Round = rounds[i];
            if (i > 0) {
                let stakes: number = this.getStakes({ rounds: rounds.slice(0, i) });
                if (stakes >= threshold) {
                    if (currentRound.p2 == tracking) {
                        trackedUses++;
                    }
                    highStakesRounds++;
                }
            }
        }

        return highStakesRounds === 0 ? 0 : (trackedUses / highStakesRounds);
    }

    // returns the number of points being played for in the current round
    private getStakes(gamestate: Gamestate) : number {
        let stakes: number = 1;
        let rounds : Round[] = gamestate.rounds;
        for (var i = rounds.length-1; i >= 0; i--) {
            if (rounds[i].p1 != rounds[i].p2) {
                break;
            } else {
                stakes ++;
            }
        }
        return stakes;
    }

    private getBombsUsed (gamestate: Gamestate) : number {
        let bombs : number = 0;
        let iAm : string = "p1";
        for (var round of gamestate.rounds) {
            if (round[iAm] == "D") {
                bombs++;
            }
        }
        return bombs;
    }

    private getBombsAgainst (gamestate: Gamestate) : number {
        let bombs : number = 0;
        let iAm : string = "p2";
        for (var round of gamestate.rounds) {
            if (round[iAm] == "D") {
                bombs++;
            }
        }
        return bombs;
    }

    private rps () : BotSelection {
        let rps : BotSelection[] = ["R","P","S"];
        return rps[Math.floor(Math.random() * 3)];
    }

    makeMove(gamestate: Gamestate): BotSelection {
        let stakes: number = this.getStakes(gamestate);
        let rps : BotSelection[] = ["R","P","S"];

        // if stakes aren't high, don't waste a dynamite
        if (stakes < HIGHSTAKETHRESHOLD) {
            // if stakes are "medium", then if they are bombing a lot, then play water, otherwise play rps
            if (stakes >= MEDIUMSTAKESTHRESHOLD) {
                let rng : number = Math.random();
                if (this.getEnemyHighStakeUsage(gamestate, "D", MEDIUMSTAKESTHRESHOLD) >= MEDIUMSTAKESDYNAMITETHRESHOLD && this.getBombsAgainst(gamestate) < 100) {
                    return "W";
                } else {
                    return this.rps();
                }
            } else {
                return this.rps();
            }
        } else {
            // if stakes are high and opponent uses waterbomb a lot under high stakes, use rps
        if (this.getEnemyHighStakeUsage(gamestate, "W", HIGHSTAKETHRESHOLD) >= WATERBOMBOVERUSETHRESHOLD) {
            return this.rps();
            } else if (this.getEnemyHighStakeUsage(gamestate, "D", HIGHSTAKETHRESHOLD) >= DYNAMITEBOMBOVERUSETHRESHOLD && this.getBombsAgainst(gamestate) < 100) {
                return "W";
            } else {
                // otherwise throw dynamite if possible
                if (this.getBombsUsed(gamestate) < 100) {
                    let rng = Math.random();
                    if (rng <= this.highStakesDynamiteChance) {
                        return "D";
                    } else if (rng - this.highStakesDynamiteChance <= this.highStakesWaterbombChance) {
                        return "W";
                    } else {
                        return this.rps();
                    }
                } else {
                    return this.rps();
                }
            }
        }
    }
}

export = new Bot();
