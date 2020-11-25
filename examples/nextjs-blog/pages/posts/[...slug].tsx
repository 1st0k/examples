import { GetStaticProps, GetStaticPaths } from "next";
import Head from "next/head";

import { useRouter } from "next/router";
import utilStyles from "../../styles/utils.module.css";
import Layout from "../../components/layout";
import Date from "../../components/date";

import { blog, postParamsToId } from "../../lib/data-loader";
import { asyncComponents } from "../../lib/components-loader";

import { render } from "@istok/mdx-compile";
import { useHydrate } from "@istok/mdx-render";
import { LocalizedBlogParams } from "@istok/blog";

import katex from "rehype-katex";
import math from "remark-math";

import "katex/dist/katex.min.css";

export type PostProps = {
  postData: {
    components: string[];
    compiledSource: string;
    scope: any;
    metadata: {
      date: string;
      title: string;
    };
    contentHtml: string;
  };
};

export default function Post(props: PostProps) {
  const { isFallback } = useRouter();

  if (isFallback) {
    return "loading...";
  }

  const { postData } = props;
  const { metadata, contentHtml, compiledSource, scope } = postData;

  const content = useHydrate(
    {
      compiledSource,
      contentHtml,
      scope,
    },
    {
      asyncComponents: asyncComponents(props.postData.components),
    },
    { element: "div" }
  );

  return (
    <Layout>
      <>
        <Head>
          <title>{metadata.title}</title>
        </Head>
        <article>
          <h1 className={utilStyles.headingXl}>{metadata.title}</h1>
          <div className={utilStyles.lightText}>
            <Date dateString={metadata.date} />
          </div>
          {content}
        </article>
      </>{" "}
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async function getStaticPaths() {
  const ids = await blog.getPostsList();
  return {
    paths: blog.getPostsParams(ids),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async function getStaticProps(
  context
) {
  const { params, locale } = context;

  if (!params || !params.slug || !locale) {
    throw new Error(`"params" and "locale" are required for page props`);
  }

  const slug = params.slug as string[];

  const post = await blog.getPost(
    postParamsToId(context as LocalizedBlogParams)
  );

  const { metadata, content } = await blog.getPostMetadata(post);

  const { compiledSource, contentHtml, scope } = await render(content, {
    asyncComponents: asyncComponents(metadata.components),
    compileOptions: {
      compilers: [],
      rehypePlugins: [katex],
      remarkPlugins: [math],
      resourceToURL(s) {
        return s;
      },
    },
  });

  return {
    props: {
      slug,
      postData: {
        components: metadata.components,
        compiledSource,
        scope,
        metadata,
        contentHtml,
      },
    },
  };
};
