import React from "react";
import { connect } from "react-redux";

import avatar from "../../assets/img/avatar.png";
import search_icon from "../../assets/img/search.png";
import menu_icon from "../../assets/img/menu.png";

import { updateSearchResult, updateToken } from "../../actions";

var Spotify = require("spotify-web-api-js");
var spotifyApi = new Spotify();

class Header extends React.Component {
  componentWillMount() {
    this.getToken();
  }

  getToken() {
    const hash = window.location.hash
      .substring(1)
      .split("&")
      .reduce(function(initial, item) {
        if (item) {
          var parts = item.split("=");
          initial[parts[0]] = decodeURIComponent(parts[1]);
        }
        return initial;
      }, {});
    window.location.hash = "";

    let _token = hash.access_token;

    const authEndpoint = "https://accounts.spotify.com/authorize";
    const clientId = "6425d030e575402ca3e9d8a5b393cae5";
    const redirectUri = "http://localhost:3000";

    if (!_token) {
      window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&show_dialog=true`;
    }

    spotifyApi.setAccessToken(_token);
    this.props.updateToken(_token);
  }

  handleSearch(event) {
    const search_value = event.target.value;
    let result = {
      result_flag: 0,
      artists_data: "",
      artists_currentPage: 0,
      tracks_data: "",
      tracks_currentPage: 0,
    };

    spotifyApi.searchArtists(search_value, { limit: 4 }).then(
      function(artists_data) {
        result.artists_data = { 1: artists_data };
        result.artists_currentPage = 1;

        spotifyApi.searchTracks(search_value, { limit: 8 }).then(
          function(tracks_data) {
            result.tracks_data = { 1: tracks_data };
            result.tracks_currentPage = 1;
            if (artists_data.length === 0 && tracks_data.length === 0) {
              result.result_flag = 0;
              this.props.updateSearchResult(result);
            } else {
              result.result_flag = 1;
              this.props.updateSearchResult(result);
            }
          }.bind(this),
          function(err) {
            console.log(err);
            if (search_value === "") {
              result.result_flag = 0;
              this.props.updateSearchResult(result);
            } else {
              result.result_flag = 2;
              this.props.updateSearchResult(result);
            }
          }.bind(this)
        );
      }.bind(this),
      function(err) {
        console.log(err);
        if (search_value === "") {
          result.result_flag = 0;
          this.props.updateSearchResult(result);
        } else {
          result.result_flag = 2;
          this.props.updateSearchResult(result);
        }
      }.bind(this)
    );
  }

  render() {
    return (
      <header>
        <div>
          <img className="avatar" src={avatar} alt="avatar" />
          <img className="search_icon" src={search_icon} alt="search" />
          <input
            className="search_input"
            type="text"
            name="spotify_search"
            placeholder="Search songs, artists..."
            onChange={(event) => this.handleSearch(event)}
          ></input>
        </div>
        <div>
          <span className="helper" />
          <span className="header_item">Premium</span>
          <span className="header_item">Help</span>
          <span className="header_item">Download</span>
          <img className="menu_icon" src={menu_icon} alt="menu" />
        </div>
      </header>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({
  updateSearchResult: (result) => dispatch(updateSearchResult(result)),
  updateToken: (token) => dispatch(updateToken(token)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
