import { createStore } from "redux";
import rotateReducer from "./reducer";

interface RootState {
    rotating: boolean;
}

function configureStore(state: RootState = { rotating: true }) {
    return createStore(rotateReducer, state);
}

export default configureStore;