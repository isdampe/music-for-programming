const fmp3 = require("fat-mp3");
const endPoint = "https://rainymood.com/audio1110/0.mp3";

class MfpRain
{
	constructor() {
		this._player = new fmp3(endPoint);
		this._player.startBuffering();
		this._playing = false;
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
}

module.exports = MfpRain;
