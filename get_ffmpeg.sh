# Download file from given url to public folder

mkdir -p ./public
curl -o ./public/ffmpeg-core.js https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js
curl -o ./public/ffmpeg-core.wasm https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.wasm
# curl -o ./public/ffmpeg-core.js https://unpkg.com/@ffmpeg/core-mt@0.12.4/dist/umd/ffmpeg-core.js
# curl -o ./public/ffmpeg-core.wasm https://unpkg.com/@ffmpeg/core-mt@0.12.4/dist/umd/ffmpeg-core.wasm
# curl -o ./public/ffmpeg-core.worker.js https://unpkg.com/@ffmpeg/core-mt@0.12.4/dist/umd/ffmpeg-core.worker.js

