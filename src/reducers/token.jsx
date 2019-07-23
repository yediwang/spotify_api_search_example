const token = (state = "", action) => {
  switch (action.type) {
    case "UPDATE_TOKEN":
      state = action.token;
      return state;
    default:
      return state;
  }
};

export default token;
