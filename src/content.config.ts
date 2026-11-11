// Copyright (c) 2026 StayBlue
// SPDX-License-Identifier: MIT

import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { blogSchema } from 'starlight-blog/schema';
import { ExtendDocsSchema } from 'starlight-theme-black/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: (context) => blogSchema(context).extend(ExtendDocsSchema.shape),
		}),
	}),
};
