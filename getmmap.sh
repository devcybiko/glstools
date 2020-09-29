#!/bin/bash
mmapdir=~/git/mmap
glstoolsdir=~/git/glstools

rm -rf $glstoolsdir/js/mmap
mkdir $glstoolsdir/js/mmap
cp -R $mmapdir/build $glstoolsdir/js/mmap
cp $mmapdir/index.js $glstoolsdir/js/mmap