const tui = require("./mfp-tui.js"); 
const mfpApi = require('./mfp-api.js');
const mfpRain = require("./mfp-rain.js");
const fmp3 = require("fat-mp3");

const STATUS_LOADING = 0x0;
const STATUS_IDLE = 0x1;
const STATUS_PLAY = 0x2;
const STATUS_PAUSED = 0x3;

const VOLUME_STEP = 0.1;

class Mfp 
{
	constructor(args) {
		this.ui = new tui();
		this.api = new mfpApi();
		this.rain = new mfpRain();
		this.currentMusicTrack = null;
		this.musicPlayer = null
		this._musicVolume = 1.0;
		this._activeChannel = 1;
		this._playing = false;
		this._args = {
			autoPlayRain: false,
			autoPlayRandom: false
		};

		for (let arg in args)
			this._args[arg] = args[arg];

		this._status = null;
		this._setStatus(STATUS_LOADING);
		this._setKeys();
		this._fetchTracks();

		if (this._args.autoPlayRain) {
			this.rain.toggle(() => {
				this._renderStatus();
			});
		}
	}

	_setKeys() {
		this.ui.setKey(["escape", "q", "C-c"], (ch, key) => {
			process.exit(0);
		});
		this.ui.setKey(["r"], (ch, key) => {
			this.rain.toggle(() => {
				this._renderStatus();
			});
		});
		this.ui.setKey(["p"], (ch, key) => {
			this.toggleMusic();
		});
		this.ui.setKey(["1"], (ch, key) => {
			this._activeChannel = 1;
			this._renderStatus();
		});
		this.ui.setKey(["2"], (ch, key) => {
			this._activeChannel = 2;
			this._renderStatus();
		});
		this.ui.setKey(["<"], (ch, key) => {
			this._decreaseChannelVolume();
		});
		this.ui.setKey([">"], (ch, key) => {
			this._increaseChannelVolume();
		});
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

			if (this._args.autoPlayRandom) {
				const idx = Math.floor(Math.random() * tracks.length);
				const track = tracks[idx];
				this._fetchAndPlay(track.title, track.link, track.guid);
				this.ui.setSelectedTrack(idx);
			}

		});
	}

	_setStatus(status) {
		if (this._status == status)
			return;

		this._status = status;
		this._renderStatus();	
	}

	_getVolumeStr() {
		let volumeStr = `Channel volumes: `;
		if (this._activeChannel == 1)
			volumeStr += `{bold}M{/bold}`;
		else
			volumeStr += `M`;
			
		volumeStr += `: ${Math.floor(this._musicVolume * 100)}%, `;
		
		if (this._activeChannel == 2)
			volumeStr += `{bold}R{/bold}`;
		else
			volumeStr += `R`;
		
		volumeStr += `: ${Math.floor(this.rain._volume * 100)}%`;

		return volumeStr;
	}

	_renderStatus() {
		const rainStatus = (this.rain.isActive() ? "with rain" : "");
		const volumeStr = this._getVolumeStr();

		switch (this._status) {
			case STATUS_IDLE:
				this.ui.setStatusText(`Idle ${rainStatus}`, true, volumeStr);
				break;
			case STATUS_LOADING:
				this.ui.setStatusText(`Loading... ${rainStatus}`, true, volumeStr);
				break;
			case STATUS_PLAY:
				this.ui.setStatusText(`Playing ${this.currentMusicTrack} ${rainStatus}`, false, volumeStr);
				break;
			case STATUS_PAUSED:
				this.ui.setStatusText(`PAUSED - ${this.currentMusicTrack} ${rainStatus}`, true, volumeStr);
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
		this.musicPlayer.setVolume(this._musicVolume);
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

	/**
	 * Sets the current rain volume.
	 * @param {Float} level The level of rain volume.
	 * @return {Void}
	 */
	setVolume(level) {

		if (level > 1.0)
			level = 1.0;
		else if (level < 0.0)
			level = 0.0;

		if (this.musicPlayer)
			this.musicPlayer.setVolume(level);

		this._musicVolume = level;
	}

	_increaseChannelVolume() {
		if (this._activeChannel == 1)
			this.setVolume(this._musicVolume + VOLUME_STEP);
		else
			this.rain.increaseVolume();

		this._renderStatus();
	}
	
	_decreaseChannelVolume() {
		if (this._activeChannel == 1)
			this.setVolume(this._musicVolume - VOLUME_STEP);
		else
			this.rain.decreaseVolume();

		this._renderStatus();

	}

}

module.exports = Mfp;
