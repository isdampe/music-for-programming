const blessed = require("blessed");
const sha1 = require("sha1");

const GFX_NOW_PL_HEIGHT = 5;
const GFX_COL_WIDTH = "49.75%";
const GFX_KEY_HEIGHT = 7;

const EVT_SELECT_ALBUM = "selectAlbum";

class MfpTui
{
	constructor() {
		this._screen = null;
		this._title = "musicforprogramming.net";
		this._boxes = {};
		this._albumList = null;
		this._albumCallbackMap = {};
		this._buildTui();
		this._render();
	}

	_render() {
		this._screen.render();
	}

	_buildTui() {

		var nowPlayingBoxHeight = 5,
			columnWidth = '49.75%',
			keysBoxHeight = 7;

		this._screen = blessed.screen({
			smartCSR: true,
			title: this._title
		});

		this._boxes.nowPlaying = blessed.box({
			parent: this._screen,
			top: "top",
			left: 0,
			right: 0,
			height: GFX_NOW_PL_HEIGHT,
			content: " Welcome to musicforprogramming.net\n {bold}Loading...{/bold}",
			tags: true,
			border: {
				type: "line"
			},
			style: {
				fg: "white",
				border: {
					fg: "#f0f0f0"
				}
			}
		});

		this._boxes.trackList = blessed.box({
			parent: this._screen,
			top: GFX_NOW_PL_HEIGHT,
			right: 0,
			width: GFX_COL_WIDTH,
			bottom: GFX_KEY_HEIGHT,
			content: " No album selected",
			tags: true,
			border: {
				type: "line"
			},
			style: {
				fg: "white",
				border: {
					fg: "#f0f0f0"
				}
			}
		});

		this._boxes.keys = blessed.box({
			parent: this._screen,
			right: 0,
			width: GFX_COL_WIDTH,
			height: GFX_KEY_HEIGHT,
			bottom: 0,
			content: " {bold}Controls{/bold}\n {bold}Enter{/bold}: Select album\n {bold}P{/bold}: Toggle play/pause\n {bold}R{/bold}: Toggle rain\n {bold}Q / Ctrl + C{/bold}: Quit",
			tags: true,
			border: {
				type: "line"
			},
			style: {
				fg: "white",
				border: {
					fg: "#f0f0f0"
				}
			}
		});

		this._albumList = blessed.list({
			parent: this._screen,
			width: GFX_COL_WIDTH,
			left: 0,
			top: GFX_NOW_PL_HEIGHT,
			bottom: 0,
			left: "left",
			align: "left",
			fg: "white",
			border: {
				type: "line"
			},
			selectedBg: "red",
			keys: true,
			vi: true
		});

		this._albumList.on("select", (node) => {
			this._onAlbumSelect(node);
		});

		this._albumList.focus();
	}

	_onAlbumSelect(node) {
		const hash = sha1(node.content);
		if (! this._albumCallbackMap.hasOwnProperty(hash))
			return;

		this._albumCallbackMap[hash]();
	}

	/**
	 * Sets hotkeys on the screen instance.
	 * @param {Array} keyArray The array of key codes to bind to.
	 * @param {Function} callback(ch, key) The callback function to call upon trigger.
	 * @return {Void}
	 */
	setKey(keyArray, callback) {
		this._screen.key(keyArray, callback);
	}

	/**
	 * Inserts an entry to the album list.
	 * @param {String} text The text to insert into the list.
	 * @param {Function} callback The function callback to execute when the new entry is selected by the user.
	 * @return {Void}
	 */
	insertAlbumEntry(text, callback) {
		this._albumList.addItem(text);
		this._screen.render();
		this._albumCallbackMap[sha1(text)] = callback;
	}

	/**
	 * Sets the track list text.
	 * @param {String} text The text content to set.
	 * @return {Void}
	 */
	setTrackList(text) {
		this._boxes.trackList.content = text;
		this._screen.render();
	}

	/**
	 * Sets the current status text.
	 * @param {String} text The status text
	 * @param {Boolean} bold True for bold
	 * @return {Void}
	 */
	setStatusText(text, bold) {
		let status = text;
		if (bold)
			status = `{bold}${status}{/bold}`;

		this._boxes.nowPlaying.content = " Welcome to musicforprogramming.net\n " + status;
		this._screen.render();
	}
}

module.exports = MfpTui;
