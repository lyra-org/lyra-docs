// Copyright (c) 2026 StayBlue
// SPDX-License-Identifier: MIT

// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';
import starlightThemeBlack from 'starlight-theme-black';

// https://astro.build/config
export default defineConfig({
	site: 'https://lyra.pub',
	integrations: [
		starlight({
			title: 'Lyra',
			logo: {
				light: './src/assets/logo-light.svg',
				dark: './src/assets/logo-dark.svg',
			},
			social: [
				{ icon: 'gitlab', label: 'Source', href: 'https://git.lyra.pub/lyra/lyra' },
				{ icon: 'discord', label: 'Discord', href: 'https://discord.gg/AvYTcZYzJh' },
			],
			plugins: [
				starlightThemeBlack({
					navLinks: [
						{ label: 'Docs', link: '/guides/getting-started/' },
						{ label: 'Blog', link: '/blog/' },
					],
				}),
				// The theme overrides `ThemeSelect`, so the blog's header link is
				// disabled and the theme's `navLinks` provides it instead.
				starlightBlog({ navigation: 'none' }),
			],
			sidebar: [
				{
					label: 'Guides',
					items: [{ autogenerate: { directory: 'guides' } }],
				},
			],
		}),
	],
});
