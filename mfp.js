#!/usr/bin/env node
const tui = require("./lib/mfp-tui.js"); 
const mfpApi = require('./lib/mfp-api.js');
const mfpRain = require("./lib/mfp-rain.js");
const fmp3 = require("fat-mp3");

const STATUS_LOADING = 0x0;
const STATUS_IDLE = 0x1;
const STATUS_PLAY = 0x2;
const STATUS_PAUSED = 0x3;

class Mfp 
{
	constructor() {
		this.ui = new tui();
		this.api = new mfpApi();
		this.rain = new mfpRain();
		this.currentMusicTrack = null;
		this.musicPlayer = null
		this._playing = false;

		this._status = null;
		this._setStatus(STATUS_LOADING);
		this._setKeys();
		this._fetchTracks();
	}

	_setKeys() {
		this.ui.setKey(["escape", "q", "C-c"], (ch, key) => {
			process.exit(0);
		});
		this.ui.setKey(["r"], (ch, key) => {
			this.rain.toggle(() => {
				this._renderStatus();
			});
		})
		this.ui.setKey(["p"], (ch, key) => {
			this.toggleMusic();
		})
	}

	_fetchTracks() {
		this._setStatus(STATUS_LOADING);
		this.api.fetchTracks((err, tracks) => {
			if (err)
				this._fatal("Error fetching album list.");

			for (let track of tracks) {
				let title = track.title.replace(/Episode /g, "");
				this.ui.insertAlbumEntry(title, () => {
					this._fetchAndPlay(track.title, track.link, track.guid);
				});
			}

			if (this._status == STATUS_LOADING)
				this._setStatus(STATUS_IDLE);
		});
	}

	_setStatus(status) {
		if (this._status == status)
			return;

		this._status = status;
		this._renderStatus();	
	}

	_renderStatus() {
		const rainStatus = (this.rain.isActive() ? "with rain" : "");
		switch (this._status) {
			case STATUS_IDLE:
				this.ui.setStatusText(`Idle ${rainStatus}`, true);
				break;
			case STATUS_LOADING:
				this.ui.setStatusText(`Loading... ${rainStatus}`, true);
				break;
			case STATUS_PLAY:
				this.ui.setStatusText(`Playing ${this.currentMusicTrack} ${rainStatus}`, false);
				break;
			case STATUS_PAUSED:
				this.ui.setStatusText(`PAUSED - ${this.currentMusicTrack} ${rainStatus}`, true);
				break;
		}
	}

	_fetchAndPlay(albumTitle, albumLink, fileLink) {
		if (this.currentMusicTrack == fileLink)
			return;

		this._setStatus(STATUS_LOADING);
		this.api.fetchTrackList(albumLink, (err, trackList) => {
			if (err)
				this._fatal("Error fetching track list.");

			this.ui.setTrackList(`${albumTitle}${trackList}`);
			this.currentMusicTrack = fileLink;
			this._autoPlay();
		});
	}

	_autoPlay() {
		if (! this.currentMusicTrack)
			return;

		if (this.musicPlayer) {
			this.musicPlayer.pause(() => {
				this.musicPlayer = null;
				this._autoPlay();
			});
			return;
		}

		this.musicPlayer = new fmp3(this.currentMusicTrack);
		this.musicPlayer.play();
		this._playing = true;
		this._setStatus(STATUS_PLAY);
	}

	toggleMusic() {
		if (! this.currentMusicTrack)
			return;

		if (this._playing) {
			this.musicPlayer.pause();
			this._setStatus(STATUS_PAUSED);
		} else {
			this.musicPlayer.play();
			this._setStatus(STATUS_PLAY);
		}

		this._playing = !this._playing;
	}

	_fatal(error) {
		console.error(error);
		process.exit(1);
	}
}

const mfp = new Mfp();
