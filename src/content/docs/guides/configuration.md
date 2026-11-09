---
title: Configuration
description: Override Lyra's settings with a configuration file.
sidebar:
  order: 2
---

Configuration is optional; most settings can be changed from the web interface.

## Use a configuration file

Create `config.json` beside `compose.yaml` before mounting it; otherwise Docker creates a directory in its place. For example, to refresh metadata from providers every hour:

```json
{
  "sync": {
    "interval_secs": 3600
  }
}
```

Add this line under `volumes` in the `lyra` service:

```yaml
      - ./config.json:/config.json:ro
```

Run `docker compose up -d` to apply it. After editing the file later, run `docker compose restart`.

Settings in this file override saved settings. Remove a setting from the file to allow it to be changed from Lyra again.

## Reset saved settings

If Lyra cannot start because a saved setting is invalid, stop it and reset its settings:

```sh
docker compose stop
docker compose run --rm lyra settings reset
```

This clears all saved server settings. It does not remove values from `config.json`. Start Lyra again with `docker compose up -d`.

## Create a library at startup

To create and scan a library when Lyra starts, add a `library` block:

```json
{
  "library": {
    "path": "/music",
    "name": "Music",
    "language": "en",
    "country": "US"
  }
}
```

Use a path visible to the server. `path` is required. `name` defaults to `Music`. `language` and `country` are optional; language accepts ISO 639-1 or 639-3 codes or English names, and country accepts country codes or names.

## Run behind a reverse proxy

Lyra needs to know each client's real address for its login and connection limits. Without this, everyone behind the proxy shares one address, and one person can lock the rest out.

A proxy on the same machine as Lyra, reaching it over `127.0.0.1` or `::1` and sending `X-Forwarded-For`, works without any of the settings below.

A proxy in Docker reaches Lyra from another address, which has to be listed. Give the proxy its own Docker network with a fixed, narrow subnet:

```yaml
services:
  proxy:
    image: nginx:stable
    ports: ["443:443"]
    networks: [lyra_proxy]
  lyra:
    image: registry.lyra.pub/lyra/lyra:latest
    networks: [lyra_proxy]
networks:
  lyra_proxy:
    ipam:
      config:
        - subnet: 172.30.5.0/24
```

List that subnet in `config.json`:

```json
{
  "rate_limit": {
    "trusted_proxies": ["127.0.0.1", "::1", "172.30.5.0/24"],
    "client_ip_header": "x-forwarded-for"
  }
}
```

Anything inside a listed range can claim to be any client, so avoid broad ranges such as `172.16.0.0/12`.

Have the proxy send the header you selected and pass WebSocket upgrades through, which live updates need. With nginx:

```nginx
location / {
    proxy_pass http://lyra:4746;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $http_connection;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Only the selected header is read. If your proxy sends only `X-Real-IP` or only `Forwarded`, set `rate_limit.client_ip_header` to `x-real-ip` or `forwarded`; Lyra logs a warning when a listed proxy sends a different header from the selected one. Restart Lyra after changing either setting.

If every client still counts as one address inside the proxy's subnet, such as `172.30.5.1`, Docker is hiding client addresses from the proxy itself, as rootless Docker does by default. That is fixed in Docker's networking, not in Lyra.

## Advanced reference

### File loading and defaults

- Lyra searches for `config.json` in the working directory, beside the binary, and in the binary's parent directory. `LYRA_CONFIG_PATH` selects an exact file; it must exist.
- Unknown keys and invalid values prevent startup. The error identifies the problem.
- `port` and `db` are startup options. Other settings use the file value first, then the saved value, then the default.
- In the file, `null` explicitly unsets `published_url` or `hls.temp_disk_budget_bytes`. Other settings reject `null`, except startup options, which treat it as omitted.
- Most setting changes apply immediately. `rate_limit.*` and `hls.cleanup_startup_purge` require a restart.

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `LYRA_CONFIG_PATH` | searched | Explicit path to `config.json`; must exist when set |
| `LYRA_DATA_DIR` | `./data` | Root for server-owned state; created when serving |
| `LYRA_DB_DIR` | data dir | Directory for relative `db.path` values; created when serving |
| `LYRA_PORT` | `4746` | Listening port; overrides `port` from the file |
| `LYRA_PLUGINS_DIR` | `./plugins` | Directory plugins are loaded from; created when serving |
| `LYRA_STATIC_DIR` | searched | Directory for static web assets; must be a directory when set |
| `RUST_LOG` | `lyra_server=info,tower_http=debug,harmony_core=info` | Log filter; request logs name query parameters without their values, which log at `lyra::http::query=trace` only when that target is named |

Docker uses `/data` and `/plugins`; update their mounts if you change these paths. For a frontend override, see [custom web interface](/guides/getting-started/#optional-use-a-custom-web-interface).

### Full configuration example

Copy [`config.example.json`](https://git.lyra.pub/lyra/lyra/-/blob/main/config.example.json) to `config.json`, keeping only your overrides.

- `published_url` accepts a public HTTP or HTTPS origin, such as `https://music.example.com`.
- `covers_path` is relative to the data directory. `db.path` is relative to `LYRA_DB_DIR`, or the data directory when unset.
- `instance_stats` shows users averages computed across all users, such as average ratings. When off, genre covers also follow only the user's own listens.
- `db.kind` accepts `mmap`, `file`, or `memory`. `memory` never writes the database to disk.
- Durations are in seconds. `sync.interval_secs` sets how often provider metadata is refreshed; `0` disables periodic refreshes, but one still runs at startup.
- The HLS disk budget is in bytes; `null` or `0` means no budget.
- `plugins.auto_update` installs plugin updates the daily check finds unless they need approval; see [automatic updates](/guides/plugins/#updates).
- Transcoded audio is cached briefly in `transcodes` under the data directory, which is emptied at startup. `transcoding.cache_max_bytes` bounds its size (a larger transcode is still served, just not kept) and `transcoding.cache_ttl_seconds` removes transcodes not requested for that long. No new transcode starts while that disk has less than 1 GiB free; such requests get `503 Service Unavailable` with `Retry-After`.
- Resized or converted covers are kept in `cover-transforms` under the data directory; `covers.transform_cache_max_bytes` bounds its size (512 MiB by default), oldest evicted first. A cover's entries go when the cover does.
- `rate_limit.*` limits requests per caller. A request with a session or API key, or a download with its `media_token`, counts against that credential, and every credential of one user together gets four times `global_per_minute`; any other request counts against its client address (each IPv6 /64), read from the header named by `rate_limit.client_ip_header` only when the peer is listed in `rate_limit.trusted_proxies`, which accepts addresses and CIDR ranges. With authentication disabled every request counts against its address. Each caller gets `global_per_minute`, and a credential's API calls, besides covers and downloads, also `authenticated_per_minute`. Plugin routes authenticate their own way, so they are limited per client address. `/api/stream` is not request-limited; transcoding limits bound it instead. Login attempts get `login_per_minute` per client address. A request over a limit gets `429 Too Many Requests` with `Retry-After`.
- Each client address (each IPv6 /64) can hold 64 open connections, and further ones are closed without a response. A reverse proxy counts as one address unless it is listed in `rate_limit.trusted_proxies`, so [list yours](#run-behind-a-reverse-proxy). A listed proxy only counts toward the server-wide connection limit.
- `transcoding.max_concurrent` caps encodes across HLS, streams and downloads, and `transcoding.max_concurrent_per_user` caps one user's stream and download encodes; `0` means no limit. Anonymous requests get a per-user allowance for each client address (each IPv6 /64), and together at most half of `transcoding.max_concurrent`, rounded down. A stream or download over a limit gets `429 Too Many Requests` with `Retry-After`; HLS waits up to ten seconds for a free slot first. Serving an original file or a cached transcode is never limited.
