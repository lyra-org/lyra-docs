---
title: Getting started
description: Run Lyra with Docker Compose and add your music.
sidebar:
  order: 1
---

## Start Lyra

Install Docker Compose and save this as `compose.yaml`. Replace `/path/to/music` with your music folder's absolute path:

```yaml
services:
  lyra:
    image: registry.lyra.pub/lyra/lyra:latest
    restart: unless-stopped
    # user: "1000:1000" # Bind mounts: see storage permissions below.
    ports:
      - "4746:4746"
    volumes:
      - lyra-data:/data
      - lyra-plugins:/plugins
      - /path/to/music:/music:ro

volumes:
  lyra-data:
  lyra-plugins:
```

```sh
docker compose up -d
```

`latest` is the newest release; use `dev` for the newest development version. Lyra migrates your data one release at a time, so when you update, don't skip a release: going from 0.0.1 to 0.0.3 has to go through 0.0.2.

Fresh named volumes need no permission setup. Music is mounted read-only.

### Storage permissions

Lyra runs as `1000:1000`. To use bind mounts, create host folders and replace the volume names with their absolute paths.

- **Without user namespaces:** set `user:` to the host owner's UID:GID.
- **Rootless Docker:** use `user: "0:0"` for folders owned by the daemon's host user, or grant access to the mapped UID:GID.

To restore default storage ownership:

```sh
docker compose stop
docker compose run --rm --no-deps --user 0:0 --entrypoint chown lyra -R 1000:1000 /data /plugins
docker compose up -d
```

On bind mounts, this changes host ownership to the mapped IDs.

## Add your music

Open [http://localhost:4746](http://localhost:4746) and create an account. The first account is the administrator. If Lyra runs on another computer, replace `localhost` with its address.

Lyra then asks which [plugins](/guides/plugins/) to install. Install at least the MusicBrainz plugin: Lyra relies on a metadata provider to match your library accurately. Then add a library with `/music` as its path.

## Use a mobile app

Install the Jellyfin or OpenSubsonic plugin, then point any app that supports either one at your Lyra server's address.

- **Jellyfin apps** sign in with your Lyra username and password. Finamp has been tested against Lyra's Jellyfin support.
- **Subsonic and OpenSubsonic apps** sign in with a Lyra API key, never your password. Create a key for each app from your account's API keys, then enter it in the app's API key field, or enter your username with the key as the password and set the app to send its password in plain text (often called "legacy authentication"). Apps using token authentication can't sign in.

## Optional: use a custom web interface

Put the built frontend in `./static`. Set `LYRA_STATIC_DIR` and append the mount to the `lyra` service:

```yaml
    environment:
      LYRA_STATIC_DIR: /static
    volumes:
      - ./static:/static:ro
```

Apply with `docker compose up -d`.
