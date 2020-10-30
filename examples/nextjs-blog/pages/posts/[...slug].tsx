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
  htmlFromMarkdown,
  source,
} from "../../lib/data-loader";

export type PostProps = {
  slug: string;
  postData: {
    metadata: {
      date: string;
      title: string;
    };
    contentHtml: string;
  };
};

export default function Post(props: PostProps) {
  console.log("post page props", props);

  const { isFallback } = useRouter();

  if (isFallback) {
    return "loading...";
  }

  const { postData } = props;
  const { metadata, contentHtml } = postData;

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
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
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
  const data = await fetchPost(getResourceIdFromParams(slug, locale));

  const { metadata, content } = await getPostMetadata(data.resource);
  const contentHtml = await htmlFromMarkdown(content);

  return {
    props: {
      slug: params.slug,
      postData: {
        metadata,
        contentHtml,
      },
    },
  };
};
