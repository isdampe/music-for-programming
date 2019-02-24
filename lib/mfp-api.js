const rssParser = require("rss-parser");
const request = require("request");
const cheerio = require("cheerio");

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

	/**
	 * Fetches and parses info for a specified track from musicforprogramming.net
	 * @param {string} url - The URL of the track to fetch
	 * @param {function} callback(bool error, string trackList)
	 * @return {void}
	 */
	fetchTrackList(url, callback) {

		request(url, (err, res, body) => {
			if ( err || res.statusCode !== 200 ) {
				callback(true);
				return false;
			}

			var $ = cheerio.load(body);
			
			var rh = $('.lg-r .pad').text();
			var spl = rh.indexOf('mb)');
			var nw = rh.substring(spl + 3);

			if (nw) {
				callback(false, nw);
				return true;
			}

			callback(true);
			return false;

		});

	}

}
module.exports = mfpApi;
