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

    private stochasticRounds : number[] = [];

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

    private getWinner(prevRound : Round) : number {
        let enemMove = prevRound.p2;
        let myMove = prevRound.p1;

        if (enemMove == myMove) return 0;

        switch (myMove) {
            case "D":
                return enemMove == "W" ? -1 : 1;
            case "R":
                return (enemMove == "D" || enemMove == "P") ? -1 : 1;
            case "P":
                return (enemMove == "D" || enemMove == "S") ? -1 : 1;
            case "S":
                return (enemMove == "D" || enemMove == "R") ? -1 : 1;
            case "W":
                return (enemMove != "D") ? -1 : 1;
        }
    }

    private rps () : BotSelection {
        let rps : BotSelection[] = ["R","P","S"];
        return rps[Math.floor(Math.random() * 3)];
    }

    // TODO: make code more clear
    private getHighStakesChances (gamestate: Gamestate) : Map<BotSelection, number> {
        let chances = new Map<BotSelection, number> ( [ ['D', 6], ['W', 1], ['R', 3] ] )// "R" used for all rps to retain typing

        for (var round of this.stochasticRounds) {
            let stochasticRound = gamestate.rounds[round];
            let winner : number = this.getWinner(stochasticRound);
            let roundChoice : BotSelection = stochasticRound.p1;

            if (roundChoice == 'D' || roundChoice == 'W') {
                chances.set(stochasticRound.p1, Math.max(1, chances.get(stochasticRound.p1) + winner));
            } else {
                chances.set('R', Math.max(1, chances.get(stochasticRound.p1) + winner));
            }
        }

        if (this.getBombsUsed(gamestate) >= 100) {
            chances.delete('D')
        }

        if (this.getBombsAgainst(gamestate) >= 100) {
            chances.delete('W');
        }

        return chances;
    }

    private getMapTotal(map: Map<any,number>) {
        return Array.from(map.values()).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        );
    }

    private getRandomChoiceFromMap(map : Map<BotSelection, number>) : any {
        let total = this.getMapTotal(map);
        let random = Math.floor(Math.random() * (total-1)) + 1;
        let index = 0;
        let keys = Array.from(map.keys());

        let choice = undefined;
        do {
            choice = keys[index];
            random -= map.get(keys[index]);
            index++;
        }
        while (random > 0);

        return choice;
    }

    makeMove(gamestate: Gamestate): BotSelection {
        let stakes: number = this.getStakes(gamestate);
        let rps : BotSelection[] = ["R","P","S"];

        // if stakes aren't high, don't waste a dynamite
        if (stakes < HIGHSTAKETHRESHOLD) {
            return this.rps();
        } else {
            // if stakes are high and opponent uses waterbomb a lot under high stakes, use rps
        if (this.getEnemyHighStakeUsage(gamestate, "W", HIGHSTAKETHRESHOLD) >= WATERBOMBOVERUSETHRESHOLD) {
            return this.rps();
            } else if (this.getEnemyHighStakeUsage(gamestate, "D", HIGHSTAKETHRESHOLD) >= DYNAMITEBOMBOVERUSETHRESHOLD && this.getBombsAgainst(gamestate) < 100) {
                return "W";
            } else {
                // otherwise throw dynamite if possible
                let highStakesChances : Map<BotSelection, number> = this.getHighStakesChances(gamestate);

                console.log(highStakesChances);

                let rng = Math.ceil(Math.random() * this.getMapTotal(highStakesChances));

                this.stochasticRounds.push(gamestate.rounds.length);

                return this.getRandomChoiceFromMap(highStakesChances);
            }
        }
    }
}

export = new Bot();
