import React from "react";
import { connect } from "react-redux";

import Header from "../components/Header/Header.jsx";

import album_1 from "../assets/img/album_1.png";
import album_unknown from "../assets/img/album_unknown.png";
import left_arrow from "../assets/img/left-arrow.png";
import last_page from "../assets/img/last_page.png";
import next_page from "../assets/img/next_page.png";
import last_page_gray from "../assets/img/last_page_gray.png";
import next_page_gray from "../assets/img/next_page_gray.png";
import play from "../assets/img/play.png";
import pause from "../assets/img/pause.png";
import heart from "../assets/img/heart.png";

import { updateSearchResult } from "../actions";

let playing;

var Spotify = require("spotify-web-api-js");
var spotifyApi = new Spotify();

class App extends React.Component {
  state = {
    selected_artist: "",
    selected_track: "",
    player_current_time: 0,
    player_current_width: 0,
    playing: "",
    paused: false,
    previous_result: "",
  };

  previousArtists() {
    const artists_data = this.props.artists_data;
    const artists_currentPage = this.props.artists_currentPage;
    const tracks_data = this.props.tracks_data;
    const tracks_currentPage = this.props.tracks_currentPage;
    const result = {
      artists_data: artists_data,
      artists_currentPage: artists_currentPage - 1,
      tracks_data: tracks_data,
      tracks_currentPage: tracks_currentPage,
      result_flag: 1,
    };
    this.props.updateSearchResult(result);
  }

  loadMoreArtists(artists) {
    var request = require("request");
    var authOptions = {
      url: artists.next,
      headers: {
        Authorization: "Bearer " + this.props.token,
      },
    };
    request.get(
      authOptions,
      function(error, response, body) {
        const artists_data = this.props.artists_data;
        const artists_currentPage = this.props.artists_currentPage;
        const tracks_data = this.props.tracks_data;
        const tracks_currentPage = this.props.tracks_currentPage;
        artists_data[artists_currentPage + 1] = JSON.parse(body);
        const result = {
          artists_data: artists_data,
          artists_currentPage: artists_currentPage + 1,
          tracks_data: tracks_data,
          tracks_currentPage: tracks_currentPage,
          result_flag: 1,
        };
        this.props.updateSearchResult(result);
      }.bind(this)
    );
  }

  previousTracks() {
    const artists_data = this.props.artists_data;
    const artists_currentPage = this.props.artists_currentPage;
    const tracks_data = this.props.tracks_data;
    const tracks_currentPage = this.props.tracks_currentPage;
    const result_flag = this.props.result_flag;
    const result = {
      artists_data: artists_data,
      artists_currentPage: artists_currentPage,
      tracks_data: tracks_data,
      tracks_currentPage: tracks_currentPage - 1,
      result_flag: result_flag,
    };
    this.props.updateSearchResult(result);
  }

  loadMoreTracks(tracks) {
    var request = require("request");
    var authOptions = {
      url: tracks.next,
      headers: {
        Authorization: "Bearer " + this.props.token,
      },
    };
    request.get(
      authOptions,
      function(error, response, body) {
        const artists_data = this.props.artists_data;
        const artists_currentPage = this.props.artists_currentPage;
        const tracks_data = this.props.tracks_data;
        const tracks_currentPage = this.props.tracks_currentPage;
        const result_flag = this.props.result_flag;
        tracks_data[tracks_currentPage + 1] = JSON.parse(body);
        const result = {
          artists_data: artists_data,
          artists_currentPage: artists_currentPage,
          tracks_data: tracks_data,
          tracks_currentPage: tracks_currentPage + 1,
          result_flag: result_flag,
        };
        this.props.updateSearchResult(result);
      }.bind(this)
    );
  }

  handleArtistClick(artist) {
    this.setState({
      previous_result: this.props.search_result,
      selected_artist: artist,
    });
    let result = {
      result_flag: 3,
      artists_data: "",
      artists_currentPage: 0,
      tracks_data: "",
      tracks_currentPage: 0,
    };
    spotifyApi.getArtistAlbums(artist.id, { limit: 8 }).then(
      function(tracks_data) {
        result.tracks_data = { 1: tracks_data };
        result.tracks_currentPage = 1;
        this.props.updateSearchResult(result);
      }.bind(this),
      function(err) {
        console.log(err);
        this.props.updateSearchResult(result);
      }.bind(this)
    );
  }

  handleTrackClick(track, new_click) {
    // console.log(track)
    if (this.props.result_flag === 3) return;
    if (track === this.state.selected_track) {
      this.setState({ selected_artist: "" });
      return;
    }
    if (new_click) {
      this.setState({ selected_artist: "" });
    }
    clearInterval(playing);
    this.setState({
      player_current_time: 0,
      player_current_width: 0,
      selected_track: track,
    });
    const aud_bg = document.getElementsByClassName("player_bg");
    const sec_width = aud_bg[0].clientWidth / 30;
    if (track.preview_url !== null) {
      let i = 1;
      playing = setInterval(
        function() {
          if (this.state.paused === false) {
            const time = Math.floor(i / 100);
            this.setState({
              player_current_time: time < 10 ? "0" + time : time,
              player_current_width: (i / 100) * sec_width,
            });
            i++;
            if (i === 3000) {
              this.setState({
                player_current_time: 30,
                paused: true,
              });
              clearInterval(playing);
            }
          }
        }.bind(this),
        10
      );
    }
  }

  handlePause() {
    this.setState({ paused: true });
    var vid = document.getElementById("audio_player");
    vid.pause();
  }

  handlePlay() {
    if (this.state.player_current_time >= 29) {
      this.handleTrackClick(this.state.selected_track, false);
    }
    this.setState({ paused: false });
    var vid = document.getElementById("audio_player");
    vid.play();
  }

  renderAudioPlayer(selected_track, audio_player_class) {
    return (
      <div>
        {selected_track !== "" && selected_track.preview_url !== null && (
          <audio
            style={{ display: "none" }}
            id="audio_player"
            src={selected_track.preview_url}
            controls
            autoPlay
          />
        )}

        {selected_track !== "" && selected_track.preview_url !== null && (
          <div className={audio_player_class}>
            <div className="audio_player_info">
              <img
                className="audio_player_cover"
                src={selected_track.album.images[0].url}
                alt="album_1"
              />
              <div className="audio_player_album_name">
                <div
                  className="one_line"
                  style={{
                    marginTop: "15px",
                    color: "#353540",
                  }}
                >
                  {selected_track.name}
                </div>
                <div
                  className="one_line"
                  style={{
                    marginTop: "11px",
                    color: "#646c73",
                  }}
                >
                  {selected_track.artists[0].name}
                </div>
              </div>
            </div>
            <div className="audio_player_control">
              <div
                style={{
                  color: "#2b3143",
                  fontSize: "11px",
                  width: "77px",
                }}
              >
                0:{this.state.player_current_time} / 0:30
              </div>
              {this.state.paused === true ? (
                <img
                  className="player_control_play"
                  src={play}
                  alt="play"
                  width={32}
                  onClick={() => this.handlePlay()}
                />
              ) : (
                <img
                  className="player_control_play"
                  src={pause}
                  alt="pause"
                  width={32}
                  onClick={() => this.handlePause()}
                />
              )}
              <img className="player_control_heart" src={heart} alt="heart" />
            </div>
          </div>
        )}
      </div>
    );
  }

  renderContent() {
    const { selected_artist, selected_track } = this.state;
    const {
      result_flag,
      artists_data,
      artists_currentPage,
      tracks_data,
      tracks_currentPage,
    } = this.props;

    const content_class =
      result_flag === 0 ? "frontpage_content content" : "content";
    const artists =
      artists_data === ""
        ? undefined
        : artists_data[artists_currentPage].artists;
    let tracks =
      tracks_data === ""
        ? undefined
        : result_flag === 3
        ? tracks_data[tracks_currentPage]
        : tracks_data[tracks_currentPage].tracks;
    let cover_img = album_1;
    if (selected_track !== "") {
      if (selected_track.album.images[0] === undefined)
        cover_img = album_unknown;
      else cover_img = selected_track.album.images[0].url;
    }
    if (selected_artist !== "") {
      if (selected_artist.images[0] === undefined) cover_img = album_unknown;
      else cover_img = selected_artist.images[0].url;
    }

    return (
      <div className={content_class}>
        <div>
          <div className="album_backshadow" />
          <div className="album_selected">
            <img
              className="album_selected_cover"
              src={cover_img}
              alt="album_1"
            />
            <div
              className="album_selected_description one_line"
              style={{
                color: "#353540",
              }}
            >
              {selected_artist !== ""
                ? selected_artist.name
                : selected_track !== "" && selected_track.name}
            </div>
            <div
              className="album_selected_description one_line"
              style={{
                color: "#646c73",
              }}
            >
              {selected_artist !== ""
                ? selected_artist.genres
                : selected_track !== "" && selected_track.artists[0].name}
            </div>
          </div>
        </div>
        <div className="search_content">
          <div className="search_result">
            <div className="search_result_title">
              <img
                className="left_arrow"
                src={left_arrow}
                alt="left_arrow"
                onClick={() => {
                  result_flag === 3
                    ? this.props.updateSearchResult(this.state.previous_result)
                    : this.props.updateSearchResult({
                        result_flag: 0,
                        artists_data: "",
                        tracks_data: "",
                      });
                }}
              />
              <span className="search_result_title_text">
                {result_flag === 3 ? selected_artist.name : "Search result"}
              </span>
            </div>
            <div className="search_result_content">
              {artists !== undefined && artists.items.length !== 0 && (
                <div>
                  <div className="search_result_item">Artists</div>
                  {artists.items.map((artist) => {
                    return (
                      <div
                        className="track_row one_line"
                        key={artist.id}
                        onClick={() => this.handleArtistClick(artist)}
                      >
                        <span className="helper" />
                        {artist.images[2] === undefined ? (
                          <div
                            className="track_row_cover"
                            style={{
                              display: "inline-block",
                              width: "30px",
                              height: "30px",
                              backgroundColor: "gray",
                            }}
                          />
                        ) : (
                          <img
                            className="track_row_cover"
                            src={artist.images[2].url}
                            width={30}
                            alt="artist_row_cover"
                          />
                        )}
                        <span className="track_row_name">{artist.name}</span>
                      </div>
                    );
                  })}
                  <div className="search_result_operations">
                    <img
                      src={
                        artists.previous === null ? last_page_gray : last_page
                      }
                      style={{
                        cursor: artists.previous === null ? "" : "pointer",
                      }}
                      onClick={() => this.previousArtists()}
                      alt="last"
                    />
                    <span className="search_result_current_page">
                      {artists_currentPage}
                    </span>
                    <img
                      src={artists.next === null ? next_page_gray : next_page}
                      style={{
                        cursor: artists.next === null ? "" : "pointer",
                      }}
                      onClick={() => this.loadMoreArtists(artists)}
                      alt="next"
                    />
                  </div>
                </div>
              )}
              {tracks !== undefined && tracks.items.length !== 0 && (
                <div>
                  <div className="search_result_item">
                    {result_flag === 3 ? "Albums" : "Tracks"}
                  </div>
                  {tracks.items.map((track) => {
                    return (
                      <div
                        className="track_row one_line"
                        key={track.id}
                        onClick={() => this.handleTrackClick(track, true)}
                      >
                        <span className="helper" />
                        {result_flag === 3 ? (
                          <img
                            className="track_row_cover"
                            src={track.images[2].url}
                            width={30}
                            alt="track_row_cover"
                          />
                        ) : track.album.images[2] === undefined ? (
                          <div
                            className="track_row_cover"
                            style={{
                              display: "inline-block",
                              width: "30px",
                              height: "30px",
                              backgroundColor: "gray",
                            }}
                          />
                        ) : (
                          <img
                            className="track_row_cover"
                            src={track.album.images[2].url}
                            width={30}
                            alt="track_row_cover"
                          />
                        )}
                        <span className="track_row_name">{track.name}</span>
                      </div>
                    );
                  })}
                  <div className="search_result_operations">
                    <img
                      src={
                        tracks.previous === null ? last_page_gray : last_page
                      }
                      style={{
                        cursor: tracks.previous === null ? "" : "pointer",
                      }}
                      onClick={() => this.previousTracks()}
                      alt="last"
                    />
                    <span className="search_result_current_page">
                      {tracks_currentPage}
                    </span>
                    <img
                      src={tracks.next === null ? next_page_gray : next_page}
                      style={{
                        cursor: tracks.next === null ? "" : "pointer",
                      }}
                      onClick={() => this.loadMoreTracks(tracks)}
                      alt="next"
                    />
                  </div>
                </div>
              )}
              <div style={{ height: "30px" }} />
            </div>
          </div>
          <div className="sidebar">
            <div className="sidebar_title one_line">You might enjoy...</div>
            <div className="you_might_enjoy_content">
              <img
                className="you_might_enjoy_cover"
                src="https://i.scdn.co/image/d871b2db8618beb9e03e964ed93a2c9fae724f79"
                alt="you_might_enjoy_1"
                width={138}
              />
              <img
                className="you_might_enjoy_cover"
                src="https://i.scdn.co/image/f0a158088e3826ba739ca7ebeb8e0e511f1ed320"
                alt="you_might_enjoy_2"
                width={138}
              />
              <img
                className="you_might_enjoy_cover"
                src="https://i.scdn.co/image/779493fc5bc93b66c2f7344644265dff745de22d"
                alt="you_might_enjoy_3"
                width={138}
              />
              <img
                className="you_might_enjoy_cover"
                src="https://i.scdn.co/image/ecaff984f77f7c2ba7530ef268ff64066c7b0c68"
                alt="you_might_enjoy_4"
                width={138}
              />
            </div>
            <div className="sidebar_title one_line">Play history</div>
            <div className="history_title one_line">Down in New Orleans</div>
            <div className="history_title one_line">Belle</div>
            <div className="history_title one_line">Circle of Life</div>
            <div className="history_title one_line">Once Upon A Dream</div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      selected_artist,
      selected_track,
      player_current_width,
    } = this.state;
    const { result_flag } = this.props;

    const album_bg_div_class =
      result_flag === 0
        ? "bg_fullsize album_bg_div"
        : "bg_smallsize album_bg_div";
    const album_bg_class =
      result_flag === 0
        ? "bg_image_fullsize album_bg"
        : "bg_image_smallsize album_bg";
    let cover_img = album_1;
    const player_bg_class =
      result_flag === 0 ? "frontpage_player player_bg" : "player_bg";
    const audio_player_class =
      result_flag === 0 ? "frontpage_audio_play" : "audio_player";
    if (selected_track !== "") {
      if (selected_track.album.images[0] === undefined)
        cover_img = album_unknown;
      else cover_img = selected_track.album.images[0].url;
    }
    if (selected_artist !== "") {
      if (selected_artist.images[0] === undefined) cover_img = album_unknown;
      else cover_img = selected_artist.images[0].url;
    }

    return (
      <div>
        <div className={album_bg_div_class}>
          <img className={album_bg_class} src={cover_img} alt="album_1" />
          <div className={player_bg_class}>
            <div
              className="player_progress"
              style={{ width: player_current_width }}
            />
          </div>
        </div>

        {result_flag === 0 && selected_track === "" && (
          <div className="welcome">You fancy a search?</div>
        )}

        <Header />

        {this.renderAudioPlayer(selected_track, audio_player_class)}

        {this.renderContent()}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  token: state.token,
  search_result: state.searchResult,
  result_flag: state.searchResult.result_flag,
  artists_data: state.searchResult.artists_data,
  artists_currentPage: state.searchResult.artists_currentPage,
  tracks_data: state.searchResult.tracks_data,
  tracks_currentPage: state.searchResult.tracks_currentPage,
});

const mapDispatchToProps = (dispatch) => ({
  updateSearchResult: (result) => dispatch(updateSearchResult(result)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
