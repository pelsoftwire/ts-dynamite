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
const WATERBOMBOVERUSETHRESHOLD : number = 0.8;
const DYNAMITEBOMBOVERUSETHRESHOLD : number = 0.95;

import { Gamestate, BotSelection } from '../models/gamestate';

class Bot {

    // TODO: refactor due to high duplication with below method
    private getEnemyHighStakesDynamiteUsage(gamestate: Gamestate) : number {
        let highStakesRounds : number = 0;
        let enemyWaterBombs : number = 0;
        // use getStakes to track the stakes. If the stakes of a round are high, check whether the opponent used waterbomb

        let rounds : Round[] = gamestate.rounds;
        for (var i = rounds.length-1; i >= 0; i--) {
            let currentRound: Round = rounds[i];
            if (i > 0) {
                let stakes: number = this.getStakes({ rounds: rounds.slice(0, i) });
                if (stakes >= HIGHSTAKETHRESHOLD) {
                    if (currentRound.p2 == "D") {
                        enemyWaterBombs++;
                    }
                    highStakesRounds++;
                }
            }
        }

        return highStakesRounds === 0 ? 0 : (enemyWaterBombs / highStakesRounds);
    }

    private getEnemyHighStakesWaterbombUsage(gamestate: Gamestate) : number {
        let highStakesRounds : number = 0;
        let enemyWaterBombs : number = 0;
        // use getStakes to track the stakes. If the stakes of a round are high, check whether the opponent used waterbomb

        let rounds : Round[] = gamestate.rounds;
        for (var i = rounds.length-1; i >= 0; i--) {
            let currentRound: Round = rounds[i];
            if (i > 0) {
                let stakes: number = this.getStakes({ rounds: rounds.slice(0, i) });
                if (stakes >= HIGHSTAKETHRESHOLD) {
                    if (currentRound.p2 == "W") {
                        enemyWaterBombs++;
                    }
                    highStakesRounds++;
                }
            }
        }

        return highStakesRounds === 0 ? 0 : (enemyWaterBombs / highStakesRounds);
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

    makeMove(gamestate: Gamestate): BotSelection {
        let stakes: number = this.getStakes(gamestate);
        let rps : BotSelection[] = ["R","P","S"];

        // if stakes aren't high, don't waste a dynamite
        if (stakes < HIGHSTAKETHRESHOLD) {
            return rps[Math.floor(Math.random() * 3)];
        } else {
            // if stakes are high and opponent uses waterbomb a lot under high stakes, use rps
            if (this.getEnemyHighStakesWaterbombUsage(gamestate) >= WATERBOMBOVERUSETHRESHOLD) {
                return rps[Math.floor(Math.random() * 3)];
            } else if (this.getEnemyHighStakesDynamiteUsage(gamestate) >= DYNAMITEBOMBOVERUSETHRESHOLD) {
                return "W";
            } else {
                // otherwise throw dynamite if possible
                if (this.getBombsUsed(gamestate) < 100) {
                    return "D";
                } else {
                    return rps[Math.floor(Math.random() * 3)];
                }
            }
        }
    }
}

export = new Bot();
