import { Gamestate, BotSelection } from '../models/gamestate';

// nash equilibrium of the game is random selection.
// if no strategy from the opponent can be discerned, then play randomly, weighting the actions by their win rate (rock/paper/scissors: 1 parts, dynamite: 3 parts, water bomb: 1 part)
// keep track of the number of dynamites played to not overuse
// keep track of the number of dynamites played BY THE OPPONENT. if the number is 100, then exclude water bomb (it cant win anymore)

// are we p1 or p2?
class Bot {
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

        // fall through: no opponent strategy detected, so select randomly
        let choices : BotSelection[] = ["R", "P", "S"];
        if (this.getBombsUsed(gamestate) < 100) {
            choices.push("D");
            choices.push("D");
            choices.push("D");
        }

        return choices[Math.floor(Math.random() * choices.length)];
    }
}

export = new Bot();
