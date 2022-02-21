import React from "react";
import {Link, RouteComponentProps} from "@reach/router";
import Cookies from 'js-cookie';
import {KeyPad, score} from "../component/keypad";
import axios from "axios"
import {v4 as uuidv4} from 'uuid';


interface HomeProps {
    scores: score
    hasUpToDateScores: boolean
    user: string
    numbers: numbers
    isFetching: boolean
}

interface numbers {
    bigNums: number[]
    smallNums: number[]
    target: number
}

function setScores(data: number[]): score {
    const gamesPlayed = data.length
    const bestTime = data.sort(function (a, b) {
        return a - b;
    })[0]
    let gamesWon = 0
    let total = 0
    data.forEach((time) => {
        if (time != 61) {
            gamesWon += 1
            total += time
        }
    })
    const averageTime = Math.floor(total / gamesWon)
    return {
        gamesPlayed,
        bestTime,
        gamesWon,
        averageTime
    }
}

export class Home extends React.Component<RouteComponentProps, HomeProps> {
    constructor(props: RouteComponentProps) {
        super(props);

        let cookieName = "numbleId";
        let userId = Cookies.get(cookieName)
        if (userId == undefined) {
            let newId = uuidv4().toString();
            Cookies.set(cookieName, newId)
            userId = newId
        }

        this.state = {
            scores: {
                averageTime: null,
                bestTime: null,
                gamesWon: null,
                gamesPlayed: null
            },
            hasUpToDateScores: false,
            user: userId,
            isFetching: true,
            numbers: {
                bigNums: [],
                smallNums: [],
                target: null
            }
        };
    }

    componentDidMount() {
        this.fetchNumbers();
        this.fetchScores();
    }

    async fetchScores() {
        try {
            this.setState({...this.state, isFetching: true});
            const response = await axios.get("https://numble-game.herokuapp.com/scores?user_id=" + this.state.user);


            this.setState({scores: setScores(response.data.scores), hasUpToDateScores: true});
        } catch (e) {
            console.log(e);
            this.setState({...this.state, isFetching: false});
        }
    };

    async fetchNumbers() {
        try {
            this.setState({...this.state, isFetching: true});
            const response = await axios.get("https://numble-game.herokuapp.com/numbers");
            this.setState({numbers: response.data, isFetching: false});
        } catch (e) {
            console.log(e);
            this.setState({...this.state, isFetching: false});
        }
    };

    async saveScores(success: boolean, timeRemaining: number) {
        console.log("HELLLOOOOO")
        console.log("HELLLOOOOO")
        console.log("HELLLOOOOO")
        console.log("HELLLOOOOO")
        console.log("HELLLOOOOO")
        console.log("HELLLOOOOO")
        try {
            const timeTaken = success ? 60 - timeRemaining : 61
            const body = {user_id: this.state.user, time_taken: timeTaken}
            const response = await axios.post("https://numble-game.herokuapp.com/scores", body)
            this.setState({scores: setScores(response.data.scores), hasUpToDateScores: true});
        } catch (e) {
            console.log(e)
            this.setState({...this.state, isFetching: false});
        }
    }

    render() {
        return (

            <KeyPad userId={
                this.state.user
            } scores={this.state.scores} saveScores={() => this.saveScores} bigNums={this.state.numbers.bigNums}
                    smallNums={this.state.numbers.smallNums} target={this.state.numbers.target}/>
        );
    }
}
