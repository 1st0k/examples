import { GetStaticProps, GetStaticPaths } from "next";
import Head from "next/head";

import { useRouter } from "next/router";
import utilStyles from "../../styles/utils.module.css";
import Layout from "../../components/layout";
import Date from "../../components/date";
import {
  fetchPost,
  getAllPostsParams,
  getPostMetadata,
  getResourceIdFromParams,
  source,
} from "../../lib/data-loader";

import { render } from "@istok/mdx-compile";
import { useHydrate } from "@istok/mdx-render";

export type PostProps = {
  slug: string;
  postData: {
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
  if (!props.slug) {
    return "unknown slug";
  }

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
    {},
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
  return {
    paths: await getAllPostsParams(source),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async function getStaticProps({
  params,
  locale,
}) {
  if (!params || !params.slug || !locale) {
    throw new Error(`"params" and "locale" are required for page props`);
  }

  const slug = params.slug as string[];
  console.log("\nget data for ", slug, locale);

  try {
    const data = await fetchPost(getResourceIdFromParams(slug, locale));

    const { metadata, content } = await getPostMetadata(data.resource);

    const { compiledSource, contentHtml, scope } = await render(content);

    return {
      props: {
        slug: params.slug,
        postData: {
          compiledSource,
          scope,
          metadata,
          contentHtml,
        },
      },
    };
  } catch (e) {
    // do not prerender failed to be fetched post
    return {
      notFound: true,
    };
  }
};
