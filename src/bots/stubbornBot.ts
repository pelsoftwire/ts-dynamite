import { Gamestate, BotSelection } from '../models/gamestate';

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
        let iAm : string = "p1";
        for (var round of gamestate.rounds) {
            if (round[iAm] == "D") {
                bombs++;
            }
        }
        return bombs;
    }

    makeMove(gamestate: Gamestate): BotSelection {

        let choice : BotSelection;
        let choices : BotSelection[] = ["R","P","S","W","D"];
        let randomOverride : boolean = false;
        if (gamestate.rounds.length < 1) {
            choice = choices[Math.floor(Math.random() * 6)];
        } else {
            choice = gamestate.rounds[gamestate.rounds.length-1].p2
        }
        if (choice == "W" && this.getBombsAgainst(gamestate) == 100) {
            choices.splice(choices.indexOf("W"), 1);
            randomOverride = true;
        }
        if (choice == "D" && this.getBombsUsed(gamestate) == 100) {
            choices.splice(choices.indexOf("D"), 1);
            randomOverride = true;
        }
        if (!randomOverride) {
            return choice
        } else {
            return choices[Math.floor(Math.random() * choices.length)];
        }
    }
}

export = new Bot();
