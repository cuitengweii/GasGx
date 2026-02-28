#!/usr/bin/env sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${FTP_ENV_FILE:-$ROOT_DIR/.env.ftp}"

if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  . "$ENV_FILE"
fi

FTP_HOST="${FTP_HOST:-}"
FTP_PORT="${FTP_PORT:-21}"
FTP_USER="${FTP_USER:-}"
FTP_PASS="${FTP_PASS:-}"
FTP_BASE_DIR="${FTP_BASE_DIR:-}"
FTP_SCHEME="${FTP_SCHEME:-ftp}"
FTP_USE_EPSV="${FTP_USE_EPSV:-1}"
FTP_VERBOSE="${FTP_VERBOSE:-0}"

usage() {
  cat <<EOF
Usage:
  sh scripts/ftp_deploy.sh list [remote_dir]
  sh scripts/ftp_deploy.sh upload <local_file> <remote_file>
  sh scripts/ftp_deploy.sh download <remote_file> <local_file>

Config (from .env.ftp or env vars):
  FTP_HOST, FTP_PORT, FTP_USER, FTP_PASS
Optional:
  FTP_BASE_DIR, FTP_SCHEME, FTP_USE_EPSV, FTP_VERBOSE
EOF
}

require_config() {
  if [ -z "$FTP_HOST" ] || [ -z "$FTP_USER" ] || [ -z "$FTP_PASS" ]; then
    echo "Missing FTP config. Please set FTP_HOST/FTP_USER/FTP_PASS in .env.ftp" >&2
    exit 1
  fi
}

join_remote_path() {
  target="${1:-}"
  target="${target#/}"
  base="${FTP_BASE_DIR#/}"
  base="${base%/}"

  if [ -n "$base" ] && [ -n "$target" ]; then
    printf "%s/%s" "$base" "$target"
    return
  fi
  if [ -n "$base" ]; then
    printf "%s" "$base"
    return
  fi
  printf "%s" "$target"
}

build_url() {
  target="$(join_remote_path "${1:-}")"
  if [ -n "$target" ]; then
    printf "%s://%s:%s/%s" "$FTP_SCHEME" "$FTP_HOST" "$FTP_PORT" "$target"
  else
    printf "%s://%s:%s/" "$FTP_SCHEME" "$FTP_HOST" "$FTP_PORT"
  fi
}

run_curl() {
  if [ "$FTP_VERBOSE" = "1" ]; then
    set -- --fail --show-error --ftp-pasv --user "$FTP_USER:$FTP_PASS" "$@"
  else
    set -- --fail --show-error --silent --ftp-pasv --user "$FTP_USER:$FTP_PASS" "$@"
  fi

  if [ "$FTP_USE_EPSV" = "0" ]; then
    set -- --disable-epsv "$@"
  fi

  curl "$@"
}

cmd="${1:-}"
if [ -z "$cmd" ]; then
  usage
  exit 1
fi

require_config

case "$cmd" in
  list)
    remote_dir="${2:-}"
    run_curl --list-only "$(build_url "$remote_dir")"
    ;;
  upload)
    local_file="${2:-}"
    remote_file="${3:-}"
    if [ -z "$local_file" ] || [ -z "$remote_file" ]; then
      usage
      exit 1
    fi
    if [ ! -f "$local_file" ]; then
      echo "Local file not found: $local_file" >&2
      exit 1
    fi
    run_curl --ftp-create-dirs -T "$local_file" "$(build_url "$remote_file")"
    echo "Uploaded: $local_file -> $remote_file"
    ;;
  download)
    remote_file="${2:-}"
    local_file="${3:-}"
    if [ -z "$remote_file" ] || [ -z "$local_file" ]; then
      usage
      exit 1
    fi
    run_curl -o "$local_file" "$(build_url "$remote_file")"
    echo "Downloaded: $remote_file -> $local_file"
    ;;
  *)
    usage
    exit 1
    ;;
esac
