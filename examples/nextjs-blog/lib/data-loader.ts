import path from "path";
import { createFilesystemSource } from "@istok/source-filesystem";
import { createSourcesSequence } from "@istok/core";

import { Blog, idToPathParams, LocalizedBlogParams, paramsToId } from "@istok/blog";

export const postParamsToId = paramsToId(".md");

export const blog = new Blog<LocalizedBlogParams, { components: string }>(
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
