import { combineReducers } from "redux";
import searchResult from "./searchResult";
import token from "./token";

export default combineReducers({
  searchResult,
  token,
});
