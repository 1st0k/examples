import path from "path";
import { createFilesystemSource } from "@istok/source-filesystem";
import { createCachableSource, createMemorySource } from "@istok/core";

import {
  Blog,
  getSlugMetadata,
  idToPathParams,
  LocalizedBlogParams,
  paramsToId,
  makeAllLocalesMetadataResolver,
} from "@istok/blog";
import { createFirebaseStorageSource } from "@istok/source-firebase";

export const postParamsToId = paramsToId(".md");

export type MetadataInlineExtension = { components: string };
export type MetadataPluginFields = {
  slug: string;
  size: number;
  components: string[];
};

export type MetadataGlobal = { allLocales: string[] };

export const postsSource = createCachableSource<string>({
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

const FIREBASE_METADATA_STORAGE = process.env.FIREBASE_METADATA_STORAGE;

const internalSource = FIREBASE_METADATA_STORAGE
  ? createFirebaseStorageSource({
      options: {
        bucket: process.env.FIREBASE_BUCKET as string,
        root: ".posts-metadata",
      },
    })
  : createFilesystemSource<string>({
      root: path.resolve(process.cwd(), "./.posts-meta"),
      autoCreateRoot: true,
    });

export const blog = new Blog<
  LocalizedBlogParams,
  MetadataInlineExtension,
  MetadataPluginFields,
  MetadataGlobal
>(
  {
    posts: postsSource,
    internal: internalSource,
  },
  {
    metadata: ({ blog }) => {
      return {
        buildGlobalMetadata: makeAllLocalesMetadataResolver(blog),
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
