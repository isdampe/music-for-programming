const rssParser = require("rss-parser");

class mfpApi {

	constructor() {
		this.rssFeedUri = "http://musicforprogramming.net/rss.php";
	}

	/**
	 * Fetches and parses the RSS feed from musicforprogramming.net
	 * @param {function} callback(bool error, array tracks)
	 * @return {void}
	 */
	fetchTracks(callback) {


		rssParser.parseURL(this.rssFeedUri,(err,parsed) => {
			if ( err ) {
				callback(true,[]);
				return false;
			}

			callback(false,parsed.feed.entries);

		});

	}

}
module.exports = mfpApi;
