const fmp3 = require("fat-mp3");
const endPoint = "https://rainymood.com/audio1110/0.mp3";

const VOLUME_STEP = 0.1;

class MfpRain
{
	constructor() {
		this._player = new fmp3(endPoint);
		this._player.startBuffering();
		this._playing = false;
		this._volume = 0.8;
	}

	/**
	 * @return {Boolean} Whether the rain is active or not.
	 */
	isActive() {
		return this._playing;
	}

	/**
	 * Begins playing the rain stream.
	 * @param {Function} callback The callback function to perform after playback starts.
	 * @return {Void}
	 */
	play(callback) {
		if (this._playing)
			return;

		this._player.play();
		this._playing = true;
		this.setVolume(this._volume);

		if (typeof callback === "function")
			callback();
	}

	/**
	 * Pauses the rain stream.
	 * @param {Function} callback The callback function to perform after playback pauses.
	 * @return {Void}
	 */
	pause(callback) {
		if (! this._playing)
			return;

		this._player.pause(() => {
			this._playing = false;
			if (typeof callback === "function")
				callback();
		});
	}

	/**
	 * Toggles the rain stream.
	 * @param {Function} callback The callback function to perform after playback toggles.
	 * @return {Void}
	 */
	toggle(callback) {
		if (this._playing)
			this.pause(callback);
		else
			this.play(callback);
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

		this._player.setVolume(level);
		this._volume = level;
	}

	/**
	 * Increase the current volume by VOLUME_STEP
	 * @return {Void}
	 */
	increaseVolume() {
		this.setVolume(this._volume + VOLUME_STEP);
	}

	/**
	 * Decrease the current volume by VOLUME_STEP
	 * @return {Void}
	 */
	decreaseVolume() {
		this.setVolume(this._volume - VOLUME_STEP);
	}
}

module.exports = MfpRain;
