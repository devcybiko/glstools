# mmap

obsconded from: https://github.com/geocar/mmap

I have modified it to compile on macOS under node version 14. My fork is at: https://github.com/devcybiko/mmap

Once you recompile it on mmap/ you must run the script `getmmap.sh` to pull the salient bits over from ../mmap

THEN, you should update package.json to increment the version number for glstools

And finally do an `npm pub` to push it to npm.org

## 1/16/2021

It appears to be interfering with publishing

I'm removing it temporarily