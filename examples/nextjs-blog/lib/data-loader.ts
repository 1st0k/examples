import path from "path";
import { createFilesystemSource } from "@istok/source-filesystem";
import {
  createCachableSource,
  createMemorySource,
  isGetSetResultSuccess,
} from "@istok/core";

import {
  Blog,
  getSlugMetadata,
  idToPathParams,
  LocalizedBlogParams,
  paramsToId,
} from "@istok/blog";

export const postParamsToId = paramsToId(".md");

export type MetadataInlineExtension = { components: string };
export type MetadataPluginFields = {
  slug: string;
  size: number;
  components: string[];
};

export const source = createCachableSource<string>({
  caches: [
    {
      source: createMemorySource(),
      invalidateOnInit: true,
      invalidationInterval: 2,
    },
  ],
  source: createFilesystemSource<string>({
    root: path.resolve(process.cwd(), "./posts"),
  }),
});

const blogMetadata = createFilesystemSource({
  root: path.resolve(process.cwd(), "./.posts-meta"),
});

export async function getGlobalMeta() {
  const getListResult = await blogMetadata.get("list");

  console.log("checking global blog meta");

  let needRebuildMeta = false;

  if (!isGetSetResultSuccess(getListResult)) {
    needRebuildMeta = true;
  } else {
    const data = JSON.parse(getListResult.resource.data as string);
    if (data.invalidated) {
      needRebuildMeta = true;
    } else {
      return data.posts;
    }
  }

  if (needRebuildMeta) {
    const postsList = await blog.getPostsList();

    const meta = buildMeta(postsList.map((p) => p.id));

    await blogMetadata.set(
      "list",
      JSON.stringify({ invalidated: false, posts: meta })
    );

    return meta.posts;
  }
}

function buildMeta(ids: string[]) {
  const meta: any = {};
  for (const id of ids) {
    const params = blog.idToParams(id);
    const slug = params.params.slug.join("/");
    const lang = params.locale;

    if (!meta[slug]) {
      meta[slug] = { locales: [] };
    }
    meta[slug].locales.push(lang);
  }

  return meta;
}

export const blog = new Blog<
  LocalizedBlogParams,
  MetadataInlineExtension,
  MetadataPluginFields
>(source, {
  metadata: ({ blog }) => {
    return {
      getMetadata(post, { metadata, enhanceMetadata }) {
        const enhancedMetadata = enhanceMetadata({
          slug: getSlugMetadata(blog, post),
          size: metadata.content.length,
          components: (metadata.metadata.components ?? "")
            .split(",")
            .filter((s: string) => s.length),
        });

        return enhancedMetadata;
      },
    };
  },
  idToParams: idToPathParams,
  paramsToId: postParamsToId,
});
