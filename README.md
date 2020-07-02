# PicKoob
PicKoob e-reader


### Command to sync .epubs from Gutenberg Project
`rsync -av -m --include='**/*images.epub' --include='**/*.rdf' --include='**/*cover.medium.jpg' --include='**/*txt.utf8' --include='**/*txt.utf8.gzip' --include='*/' --exclude='*' --del aleph.gutenberg.org::gutenberg-epub /dst/dir`
