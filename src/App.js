import React from "react";
import { createStore } from "redux";
import { Provider } from "react-redux";

import Layout from "./layouts/Layout.jsx";

import rootReducer from "./reducers";

const store = createStore(rootReducer);

class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Layout />
      </Provider>
    );
  }
}

export default App;
