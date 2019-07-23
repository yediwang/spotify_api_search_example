const searchResult = (
  state = { result_flag: 0, artists_data: "", tracks_data: "" },
  action
) => {
  switch (action.type) {
    case "UPDATE_SEARCH_RESULT":
      state = action.result;
      // console.log(state)
      return state;
    default:
      return state;
  }
};

export default searchResult;
