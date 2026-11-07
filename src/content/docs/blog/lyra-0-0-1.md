---
title: Lyra 0.0.1 is out
date: 2026-11-02
excerpt: After many long years, Lyra has its first alpha release.
---

After many long years, Lyra has finally been released!

## Metadata you can trust

The original motivation for creating Lyra was to build a system where you can trust the metadata shown for a given track, album, or artist. To get there, we created a new way to store metadata: layers. Your tags, what each plugin says, and your edits each sit on their own layer, and what you see when you view an item is a composite of those layers. Lyra keeps all of that information, and you decide how it's combined: reorder or disable providers, and your own edits always come first. Our MusicBrainz plugin checks each match against your files and is backed by an extensive test suite. It can still get things wrong, so if something looks off, fix it with a manual edit.

## Plugins, sandboxed

Most music servers bake every feature a user might want directly into the server, and those with a plugin system tend to fall short in some areas. The biggest difference with Lyra is that plugins are sandboxed. Plugins are written in Luau, a language that already provides great sandbox guarantees. Every plugin declares the permissions it needs upfront, and Lyra shows each plugin's risk level before you approve it. Lyra also makes it easy to install plugins from external sources, and updating or restarting a plugin doesn't require a server restart.

Early on, we decided we wanted Jellyfin support, and to show how powerful the plugin system is, we rebuilt much of Jellyfin's API on top of it. It doesn't stop there: OpenSubsonic support, ListenBrainz scrobbling, lyrics from LRCLIB, and metadata from Wikidata and TheAudioDB are all plugins too.

## What the alpha means for you

Before, we had a policy that let us break anything at will, with no stability guarantees. Starting with today's alpha release, we're keeping that same posture, with one major change: we'll take a best-effort approach to letting you migrate your data between alpha versions, so that you don't lose it as long as you follow a supported upgrade path. Anything else can still break between versions. Upgrades go one release at a time, so 0.0.1 to 0.0.2 is supported, but 0.0.1 to 0.0.3 has to go through 0.0.2 first. You can also upgrade from a `-dev` version of a release to a later build of that release or to the release itself. For example, upgrading from 0.0.2-dev.1 to 0.0.2-dev.3 or 0.0.2 is supported, but upgrading from 0.0.2-dev.1 to 0.0.3 is not. Lyra backs up your database automatically before it migrates. We're iterating very fast, and maintaining migrations for long periods would create unnecessary friction.

That includes the REST and plugin APIs, which will change constantly during the alpha, so building on top of them isn't recommended unless you're willing to deal with that friction. Fret not, because our official plugins are in the repository included with Lyra and always support the version you're on. We recommend installing at least the MusicBrainz plugin, as Lyra relies on a metadata provider, such as MusicBrainz, to match your library accurately.

## Apps

For configuration and getting started with Lyra, we recommend the built-in website. It doesn't support all of the server's features yet, but it's good enough for daily use. We plan to create our own mobile app at some point, but we aren't in any rush. The official OpenSubsonic and Jellyfin plugins let you use any mobile app that supports either one, and the ecosystem is so vast that you're sure to find something that matches your tastes. I recommend Finamp: it has been tested against Lyra's Jellyfin support, and I've been using it for years.

:::caution
Lyra doesn't support every Jellyfin and OpenSubsonic feature. If an app misbehaves with Lyra, report it to us on our [issue tracker](https://git.lyra.pub/lyra/lyra/-/issues) or [Discord](https://discord.gg/AvYTcZYzJh) first, not to the app's developers.
:::

## Track chains and mixes

Shuffle has always had one flaw: it doesn't know that some songs belong together. Track chains fix that. Link tracks that flow into each other, and Lyra plays them as one unit, in order, whenever it shuffles or builds a mix. Lyra doesn't detect chains on its own, so you create them from an album's page in the web interface.

Mixes work the same way as the rest of Lyra: Lyra ships with a built-in mixer, and any plugin can provide its own. The AudioMuse plugin shows what's possible, with mixes built from how your music sounds, from a text description, or as a path that travels from one song to another. You choose which mixer Lyra uses.

## Installing

The binary is mostly self-contained and depends only on FFmpeg's libraries. For easier installation, and to have the web interface ready for setup out of the box, we recommend Docker Compose. Save this as `compose.yaml`, replacing `/path/to/music` with your music folder's absolute path:

```yaml
services:
  lyra:
    image: registry.lyra.pub/lyra/lyra:latest
    restart: unless-stopped
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

Then run `docker compose up -d` and open [http://localhost:4746](http://localhost:4746). The first account you create is the administrator. For bind mounts, permissions, and more, see the [getting started guide](/guides/getting-started/).

## Feedback

If something breaks or looks wrong, please [open an issue](https://git.lyra.pub/lyra/lyra/-/issues).
