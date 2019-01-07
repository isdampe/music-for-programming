#!/usr/bin/env node
const mfp = require("./lib/mfp.js");

const usage = function() {
	console.log("Usage: mfp [OPTIONS]\n");
	console.log("Options");
	console.log("    --random \tAutoplay a random track on startup.");
	console.log("    --rain   \tAutoplay rain on startup.");
	console.log("    --help   \tDisplay usage instructions.");
};

const args = {};
if (process.argv.length >= 3) {
	for (let i=2; i<process.argv.length; ++i) {
		let arg = process.argv[i].toLowerCase();
		switch (arg) {
			case "--random":
				args.autoPlayRandom = true;
				break;
			case "--rain":
				args.autoPlayRain = true;
				break;
			case "--help":
			default:
				usage();
				process.exit(0);
				break;
		}
	}
}

const session = new mfp(args);
