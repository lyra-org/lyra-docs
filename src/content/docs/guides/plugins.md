---
title: Plugins
description: Install, approve, and update Lyra plugins.
sidebar:
  order: 3
---

Plugins add metadata providers, Jellyfin and OpenSubsonic support, scrobbling, lyrics, mixes, and more. Lyra starts with none installed. Managing plugins requires the `manage_plugins` permission, which the administrator has.

## Official plugins

Lyra comes subscribed to the official plugin repository, whose plugins always support the Lyra version you're on. You choose plugins from it when you first set up Lyra, and later under **Settings → Plugins**.

| Plugin | What it does |
| --- | --- |
| MusicBrainz | Matches your library to MusicBrainz releases. Recommended. |
| Wikidata | Adds album genres and artist descriptions from Wikidata and Wikipedia. |
| TheAudioDB | Adds artist and release artwork and metadata from TheAudioDB. |
| LRCLIB | Fetches lyrics from LRCLIB. |
| ListenBrainz | Sends your listens to ListenBrainz. |
| AudioMuse | Builds mixes from how your music sounds, using an AudioMuse AI server. |
| Jellyfin | Lets Jellyfin apps connect to Lyra. |
| OpenSubsonic | Lets Subsonic and OpenSubsonic apps connect to Lyra. |

## Permissions and risk

Every plugin declares the permissions it needs, and Lyra shows what they let it do before you install it: for example, sending data off the server, adding endpoints, signing users in, or reading every user's listening history. A risk level summarises them:

- **High:** the plugin adds endpoints, signs users in, or can send every user's personal data off the server.
- **Elevated:** the plugin can send personal or library data off the server.
- **Standard:** everything else.

Installing a plugin grants the permissions you were shown, and nothing more.

## Updates

Lyra checks for plugin updates about once a day. With **automatic updates** on, the default, it installs them and applies them once nothing is playing. An update that would give a plugin new permissions waits for your approval instead, under **Waiting for approval**. Turn automatic updates off with the `plugins.auto_update` setting to only be told about updates.

Updating, reloading, or restarting a plugin doesn't restart the server.

## Other repositories

To install plugins from elsewhere, add a repository under **Settings → Plugins → Repositories**. Lyra installs from Git repositories on GitHub, GitLab, and Gitea or Forgejo, including self-hosted instances. Plain repository URLs and browser URLs both work:

- `https://github.com/owner/repo`
- `https://github.com/owner/repo/tree/develop`
- `https://codeberg.org/owner/repo/src/branch/develop`
- `https://gitlab.example.org/group/repo/-/tree/develop`

A branch tracks new releases. A tag or commit pins the plugins to that release, and they never update. Add `?ref=<branch|tag|commit>` to choose a ref containing slashes, such as `release/v2`.

Removing a repository keeps its installed plugins. Plugins copied into the plugins folder by hand are never touched by repository installs, updates, or removals.
