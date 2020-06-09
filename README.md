# pickoob
PicKoob on-line e-reader


### Command to sync .epubs from Gutenberg Project
`rsync -av -m --include='**/*images.epub' --include='**/*.rdf'  --include='*/' --exclude='*' --del aleph.gutenberg.org::gutenberg-epub /dest/dir/`
