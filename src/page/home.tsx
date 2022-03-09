import React from "react";
import {RouteComponentProps} from "@reach/router";
import Cookies from 'js-cookie';
import {KeyPad, score} from "../component/keypad";
import axios from "axios"
import {v4 as uuidv4} from 'uuid';
import Header from "../component/header";
import {FirstModal} from "../component/first_modal";
import {ScoresModal} from "../component/scores";
import {HintsModal} from "../component/hints_modal";


interface HomeProps {
    scores: score
    hasUpToDateScores: boolean
    user: string
    numbers: numbers
    isFetching: boolean
    showModal: boolean
    showScoresModal: boolean
    showHintsModal: boolean
    refresh: boolean
}

interface numbers {
    bigNums: number[]
    smallNums: number[]
    target: number,
    hints: string
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
            scores: JSON.parse(localStorage.getItem("scores")) as score || {} as score,
            hasUpToDateScores: false,
            user: userId,
            isFetching: true,
            numbers: {
                bigNums: [],
                smallNums: [],
                target: null,
                hints: ""
            },
            showModal: true,
            showScoresModal: false,
            showHintsModal: false,
            refresh: false
        };
    }

    componentDidMount() {
        this.fetchNumbers();
        this.setState({showModal: this.state.scores.gamesPlayed == 0})
    }

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

    showModal() {
        this.setState({showModal: !this.state.showModal})
    }

    showScoresModal() {
        this.setState({showScoresModal: !this.state.showScoresModal})
    }

    showHintsModal() {
        this.setState({showHintsModal: !this.state.showHintsModal})
    }

    refreshState() {
        this.setState({refresh: !this.state.refresh})
    }


    render() {
        return (
            <div>
                <Header showScores={() => this.showScoresModal()} showHints={() => this.showHintsModal()} showRules={() => this.showModal()}/>
                <FirstModal close={()=> this.setState({showModal: false})} show={this.state.showModal} />
                <ScoresModal scores={this.state.scores} close={()=> this.setState({showScoresModal: false})} show={this.state.showScoresModal} />
                <HintsModal refresh={this.state.refresh} close={()=> this.setState({showHintsModal: false})} show={this.state.showHintsModal} hints={this.state.numbers.hints?.split(",")} />
                <KeyPad
                    refreshState={() => this.refreshState()}
                    showClock={!this.state.showModal}
                    userId={this.state.user}
                    bigNums={this.state.numbers.bigNums}
                    smallNums={this.state.numbers.smallNums}
                    target={this.state.numbers.target}
                    hints={this.state.numbers.hints?.split(",")}
                />
            </div>
        );
    }
}
