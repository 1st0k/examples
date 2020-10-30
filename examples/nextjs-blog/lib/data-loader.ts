import path from "path";
import matter from "gray-matter";
import remark from "remark";
import html from "remark-html";
import { createFilesystemSource } from "@istok/source-filesystem";
import {
  UniformFiniteSource,
  isGetListResultSuccess,
  isGetSetResultSuccess,
  ResourceOpResultSuccess,
  Resource,
} from "@istok/core";

type Post = Resource<string>;

export const source = createFilesystemSource<string>({
  root: path.resolve(process.cwd(), "./posts"),
});

export function localeFromId(id: string) {
  const [, filename] = id.split("/");
  const [locale] = (filename ?? "").split(".");

  return locale || "en";
}

export function slugFromId(id: string) {
  const slug = id
    .split("/")
    .filter((part) => !(part.includes("en") || part.includes("ru")));

  return slug;
}

export async function getAllPostsParams(
  source: UniformFiniteSource<unknown, string>
) {
  const list = await source.getList();

  if (!isGetListResultSuccess(list)) {
    throw new Error("Failed to get list of resources.");
  }

  const paths = list.resources.map((r) => ({
    params: {
      slug: slugFromId(r.id),
      locale: localeFromId(r.id),
    },
  }));

  return paths;
}

export function getResourceIdFromParams(slug: string[], locale: string) {
  return slug.join("/") + "/" + locale + ".md";
}

export async function fetchPost(resourceId: string) {
  const data = await source.get(resourceId);

  if (!isGetSetResultSuccess(data)) {
    throw new Error(`Failed to get resource ${resourceId}.`);
  }

  return data;
}

export async function fetchPosts(
  source: UniformFiniteSource<unknown, string>,
  locale: string
) {
  const list = await source.getList((id) => {
    return id.includes(`/${locale}`);
  });

  if (!isGetListResultSuccess(list)) {
    throw new Error("Failed to get list of resources.");
  }

  const rawData = await Promise.all(
    list.resources.map(({ id }) => source.get(id))
  );

  if (!rawData.every(isGetSetResultSuccess)) {
    throw new Error("Failed to get resource.");
  }

  const posts = rawData as ResourceOpResultSuccess<string>[];

  return posts.map((p) => p.resource);
}

export async function getPostMetadata(post: Post) {
  const { data, content } = matter(post.data);

  return {
    metadata: data,
    content,
    id: post.id,
  };
}

export async function htmlFromMarkdown(markdown: string) {
  const processedContent = await remark().use(html).process(markdown);
  const contentHtml = processedContent.toString();

  return contentHtml;
}
