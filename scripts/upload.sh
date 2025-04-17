#!/bin/bash -e

rclone copyto ./osm-japan.pmtiles km-tileserver:km-tileserver/osm-japan.pmtiles --progress --s3-no-check-bucket --s3-chunk-size=256M
echo "Uploaded latest basetiles to https://tiles.kmproj.com/osm-japan.json"
