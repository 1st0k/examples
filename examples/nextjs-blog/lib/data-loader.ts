import path from "path";
import matter from "gray-matter";
import { createFilesystemSource } from "@istok/source-filesystem";
import { Resource, createSourcesSequence } from "@istok/core";

import { Blog, idToPathParams, paramsToId } from "@istok/blog";

type Post = Resource<string>;

export const postParamsToId = paramsToId(".md");

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
    paramsToId: postParamsToId,
  }
);

export async function getPostMetadata(post: Post) {
  const { data, content } = matter(post.data);

  return {
    metadata: data,
    content,
    id: post.id,
  };
}
