import { Gamestate, BotSelection } from '../models/gamestate';

type Round = {
    p1: BotSelection,
    p2: BotSelection
}

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

    // if no previous rounds, throw an error
    private didIWinPreviousRound (gamestate: Gamestate) : boolean {
        if (gamestate.rounds.length == 0) {
            throw new Error ("no previous rounds");
        }

        let previousRound : Round = gamestate.rounds[gamestate.rounds.length - 1];

        switch (previousRound.p1) {
            case "R":
                return previousRound.p2 == "S";
            case "S":
                return previousRound.p2 == "P";
            case "P":
                return previousRound.p2 == "R";
            case "D":
                return previousRound.p2 != "D" && previousRound.p2 != "W";
            case "W":
                return previousRound.p2 == "D";
        }
    }

    makeMove(gamestate: Gamestate): BotSelection {
        let choices : BotSelection[] = ["R","P","S","D","W"];
        let choice : BotSelection
        if (gamestate.rounds.length == 0) {
            return choices[Math.floor(Math.random() * choices.length)];
        }

        if (this.didIWinPreviousRound(gamestate)) {
            choice = gamestate.rounds[gamestate.rounds.length-1].p1;
        } else {
            choice = choices[Math.floor(Math.random() * choices.length)];
        }

        // choice override
        let choiceOverride : boolean = false;
        if (choice == "D" && this.getBombsUsed(gamestate) == 100) {
            choiceOverride = true;
            choices.splice(choices.indexOf("D"), 1);
        } else if (choice == "W" && this.getBombsAgainst(gamestate) == 100) {
            choices.splice(choices.indexOf("W"), 1);
        }

        if (choiceOverride) {
            return choices[Math.floor(Math.random() * choices.length)];
        } else {
            return choice;
        }
    }
}

export = new Bot();
