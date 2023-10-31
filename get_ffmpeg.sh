# Download these files only if they are absent

mkdir -p ./public
if [ ! -f ./public/ffmpeg-core.js ]; then
    curl -o ./public/ffmpeg-core.js https://raw.githubusercontent.com/ffmpegwasm/ffmpeg.wasm/0.12.4/ffmpeg-core.js
fi
if [ ! -f ./public/ffmpeg-core.wasm ]; then
    curl -o ./public/ffmpeg-core.wasm https://raw.githubusercontent.com/ffmpegwasm/ffmpeg.wasm/0.12.4/ffmpeg-core.wasm
fi
# curl -o ./public/ffmpeg-core.js https://unpkg.com/@ffmpeg/core-mt@0.12.4/dist/umd/ffmpeg-core.js
# curl -o ./public/ffmpeg-core.wasm https://unpkg.com/@ffmpeg/core-mt@0.12.4/dist/umd/ffmpeg-core.wasm
# curl -o ./public/ffmpeg-core.worker.js https://unpkg.com/@ffmpeg/core-mt@0.12.4/dist/umd/ffmpeg-core.worker.js

