import path from "path";
import { createFilesystemSource } from "@istok/source-filesystem";
import { createSourcesSequence } from "@istok/core";

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

export const blog = new Blog<
  LocalizedBlogParams,
  MetadataInlineExtension,
  MetadataPluginFields
>(
  createSourcesSequence([
    {
      source: createFilesystemSource<string>({
        root: path.resolve(process.cwd(), "./posts"),
      }),
    },
  ]),
  {
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
  }
);
