# musicForProgramming
Stream musicforprogramming.net directly in your terminal!

![Terminal Window running music-for-programming](screenshot.png)

## Installing
```bash
cd /opt
mkdir mfp
cd mfp
npm install -g music-for-programming
cd node_modules/music-for-programming
chmod +x mfp.js
sudo ln -s /opt/mfp/node_modules/music-for-programming/mfp.js /usr/local/bin/mfp
```

## Running
```bash
$ mfp
```

## Controls
Use the arrow keys to move up and down between albums.

```Enter:``` To select an album  
```P:``` To toggle play / pause on music  
```R:``` To toggle rain on/off  
```Q:``` To quit

### Thanks to
musicforprogramming.net  
rainymood.com
