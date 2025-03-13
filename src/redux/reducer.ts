interface RootState {
    rotating: boolean;
}

interface RotateAction {
    type: 'rotate';
    payload: boolean;
}

type Action = RotateAction;

export default (state: RootState = { rotating: true }, action: Action): RootState => {
    switch (action.type) {
        case "rotate":
            return {
                rotating: action.payload
            };
        default:
            return state;
    }
};