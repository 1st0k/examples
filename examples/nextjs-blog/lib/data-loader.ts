import path from "path";
import matter from "gray-matter";
import { createFilesystemSource } from "@istok/source-filesystem";
import { Resource, createSourcesSequence } from "@istok/core";

import { Blog, idToPathParams } from "@istok/blog";

type Post = Resource<string>;

export const blog = new Blog(
  createSourcesSequence([
    {
      source: createFilesystemSource<string>({
        root: path.resolve(process.cwd(), "./posts"),
      }),
    },
  ]),
  {
    idToParams: idToPathParams,
  }
);

export function getResourceIdFromParams(slug: string[], locale: string) {
  return slug.join("/") + "/" + locale + ".md";
}

export async function getPostMetadata(post: Post) {
  const { data, content } = matter(post.data);

  return {
    metadata: data,
    content,
    id: post.id,
  };
}
