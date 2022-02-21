import React from "react";
import {Link, RouteComponentProps} from "@reach/router";
import Cookies from 'js-cookie';
import {KeyPad} from "../component/keypad";
import axios from "axios"
import {v4 as uuidv4} from 'uuid';


interface HomeProps {
    scores: scores
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

interface scores {
    streak: number
    averageTime: number
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
                streak: null,
                averageTime: null
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
            const response = await axios.get("https://numble-game.herokuapp.com/scores?id=" + this.state.user);
            this.setState({scores: response.data, hasUpToDateScores: true});
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
        try {
            const body = {userId: this.state.user, success: success, timeTaken: 60 - timeRemaining}
            const response = await axios.post("https://numble-game.herokuapp.com/scores", body)

        } catch (e) {
            console.log(e)
        }
    }

    render() {
        return (
            <KeyPad isFinished={() => this.saveScores} bigNums={this.state.numbers.bigNums}
                    smallNums={this.state.numbers.smallNums} target={this.state.numbers.target}/>
        );
    }
}
