#!/usr/bin/env node
/*
 * musicForProgramming
 * A simple command line interface for streaming musicForProgramming.net
 * @author isdampe <https://github.com/isdampe>
 */
var blessed = require('blessed');
var cheerio = require('cheerio');
var request = require('request');
var StreamPlayer = require('streaming-player');
var mfpApi = require('./lib/mfp-api.js');

//Dev notes.
//Remember to modify stream-player to fix url streaming
//https://github.com/michael-gillett/node-stream-player/issues/2

const remote_endpoint = "http://musicforprogramming.net/";
const rainy_mood = "http://rainymood.com/audio1110/0.mp3";
var track1, track2;
var activeTrack, musicActive = false, rainActive = false;


(function(){

	//Blessed
	var screen, albumList, boxNowPlaying, boxTrackList;

	//Ours
	var api = new mfpApi();
	var albums = {};

	var main = function() {
		buildUI();
		fetchTracks();
	};

	var toggleRain = function() {
		if ( typeof track2 !== 'undefined' && track2.isPlaying() ) {
			stopRain();
		} else {
			playRain();
		}
		writeStatusMessage();
	};

	var stopRain = function() {
		if ( typeof track2 !== 'undefined' ) {
			if ( track2.isPlaying() ) track2.pause();
			delete track;
			rainActive = false;
		}
	}

	var playRain = function() {

		if ( typeof track2 !== 'undefined' ) {
			if ( track2.isPlaying() ) track2.pause();
		}
		track2 = new StreamPlayer();
		track2.add(rainy_mood);
		track2.play();
		rainActive = true;

	};

	var setIdle = function() {
		setStatusMessage('Idle');
	};

	var setLoading = function() {
		setStatusMessage('Loading...');
	};

	var writeStatusMessage = function() {

		var playStatus = ( musicActive === true ? 'Playing' : 'Paused' );
		var rainStatus = ( rainActive === true ? 'With rain' : '' );
		var track = ( typeof activeTrack === 'undefined' ? '' : activeTrack );

		boxNowPlaying.content = ' Welcome to musicforprogramming.net\n ' + '{bold}' + playStatus + '{/bold} ' + track + ' {bold}' + rainStatus + '{/bold}';
		screen.render();

	};

	var setStatusMessage = function(status) {

		var playStatus = ( musicActive === true ? 'Playing' : 'Paused' );

		boxNowPlaying.content = ' Welcome to musicforprogramming.net\n {bold}' + status + '{/bold}    {bold}(' + playStatus + '){/bold}';
		screen.render();

	};

	var selectTrack = function(node) {

		if ( typeof node === 'undefined' ) return;

		var key = node.content;

		if (! albums.hasOwnProperty(key) ) return;

		var obj = albums[key];

		fetchAndPlay(obj);

	};

	var fetchAndPlay = function(obj) {

		setLoading();
		var request_url = obj.link;

		//If we have already fetched the track list, don't bother again.
		if ( obj.tracklist ) {
			setTrackListText( obj.name, obj.tracklist );
			playTrack(obj,obj.key, 1);
			return;
		}

		request(request_url, function(err,res,body){
			if ( err || res.statusCode !== 200 ) {
				return false;
			}

			var $ = cheerio.load(body);

			var rh = $('.lg-r .pad').text();
			var spl = rh.indexOf('mb)');
			var nw = rh.substring(spl + 3);

			if ( nw ) albums[obj.name].tracklist = nw;

			setTrackListText( obj.name, nw );
			playTrack( obj,obj.key, 1 );

			delete $;

		});

	};

	var togglePauseMusic = function() {
		if ( typeof track1 === 'undefined' ) {
			return;
		}

		if ( track1.isPlaying() )
		{
			track1.pause();
			musicActive = false;
		} else {
			track1.play();
			musicActive = true;
		}
		writeStatusMessage();
	};

	var playTrack = function( obj,audiosrc, trackNum ) {

		if ( trackNum === 1 ) {
			if ( typeof track1 !== 'undefined' ) {
				track1.pause();
			}
			activeTrack = audiosrc;
			track1 = new StreamPlayer();
			track1.add(audiosrc);
			play(obj,trackNum);
			musicActive = true;
		}

	};

	var play = function(obj,trackNum) {
		if ( trackNum === 1 ) {
			track1.play();
			musicActive = true;
			//setStatusMessage('Playing ' + obj.name);
			writeStatusMessage();
		}
	};

	var setTrackListText = function( name, nw ) {
		boxTrackList.content = name + nw;
		screen.render();
	};

	var buildUI = function() {

		var nowPlayingBoxHeight = 5,
			columnWidth = '49.75%',
			keysBoxHeight = 7;

		// Create a screen object.
		screen = blessed.screen({
			smartCSR: true
		});

		screen.title = 'musicforprogramming';

		// Create a box perfectly centered horizontally and vertically.
		boxNowPlaying = blessed.box({
			top: 'top',
			left: 0,
			right: 0,
			height: nowPlayingBoxHeight,
			content: ' Welcome to musicforprogramming.net\n {bold}Loading...{/bold}',
			tags: true,
			border: {
				type: 'line'
			},
			style: {
				fg: 'white',
				//bg: 'magenta',
				border: {
					fg: '#f0f0f0'
				}
			}
		});

		// Append our box to the screen.
		screen.append(boxNowPlaying);

		boxTrackList = blessed.box({
			top: nowPlayingBoxHeight,
			right: 0,
			width: columnWidth,
			bottom: keysBoxHeight,
			content: ' No album selected',
			tags: true,
			border: {
				type: 'line'
			},
			style: {
				fg: 'white',
				//bg: 'magenta',
				border: {
					fg: '#f0f0f0'
				}
			}
		});
		screen.append(boxTrackList);

		var boxKeys = blessed.box({
			right: 0,
			width: columnWidth,
			height: keysBoxHeight,
			bottom: 0,
			content: ' {bold}Controls{/bold}\n {bold}Enter{/bold}: Select album\n {bold}P{/bold}: Toggle play/pause\n {bold}R{/bold}: Toggle rain\n {bold}Q / Ctrl + C{/bold}: Quit',
			tags: true,
			border: {
				type: 'line'
			},
			style: {
				fg: 'white',
				border: {
					fg: '#f0f0f0'
				}
			}
		});
		screen.append(boxKeys);


		albumList = blessed.list({
			parent: screen,
			width: columnWidth,
			left: 0,
			top: nowPlayingBoxHeight,
			bottom: '0',
			left: 'left',
			align: 'left',
			fg: 'white',
			border: {
				type: 'line'
			},
			selectedBg: 'red',
			keys: true,
			vi: true
		});

		// Select the first item.
		//albumList.select(0);
		albumList.on('select', selectTrack);

		// Quit on Escape, q, or Control-C.
		screen.key(['escape', 'q', 'C-c'], function(ch, key) {
			return process.exit(0);
		});
		screen.key(['r'], toggleRain);
		screen.key(['p'], togglePauseMusic);

		// Focus our element.
		albumList.focus();

		// Render the screen.
		screen.render();

	};

	var injectTrackIntoUI = function(track) {
		albumList.addItem(track);
		screen.render();
	};

	var failAndDie = function(msg) {
		console.error(msg);
		process.exit(1);
	};

	/**
	 * Fetches tracks and injects them into the UI
	 * @return {void}
	 */
	var fetchTracks = function() {

		api.fetchTracks((err,tracks) => {
			if ( err ) fatalError('Error fetching RSS feed');

			for ( var i=0; i<tracks.length; i++ ) {
				let track = tracks[i];

				let obj = {
					key: track.enclosure.url,
					name: track.title.replace(/Episode /g, ""),
					link: track.link,
					tracklist: false
				};
				albums[obj.name] = obj;
				injectTrackIntoUI(obj.name);
			}

			setIdle();

		});

	};

	main();

})();
