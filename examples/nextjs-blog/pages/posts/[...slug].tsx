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
import { AsyncComponentsLoadConfig } from "@istok/mdx-render/dist/load-components";

export type PostProps = {
  slug: string;
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

function makeAsyncComponentsMap(names: string[]) {
  return names.reduce<AsyncComponentsLoadConfig>((acc, curr) => {
    acc[curr] = () =>
      import("../../components/load/" + curr).then((m) => m.default);

    return acc;
  }, {});
}

// const promisedComponents = {
//   AsyncComponent: () =>
//     import("../../components/async-test").then((m) => m.default),
// };

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
    {
      promisedComponents: makeAsyncComponentsMap(props.postData.components),
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

  try {
    const data = await fetchPost(getResourceIdFromParams(slug, locale));

    const { metadata, content } = await getPostMetadata(data.resource);
    const componentsToLoad: string[] = (metadata.components ?? "")
      .split(",")
      .filter((s: string) => s.length);

    const { compiledSource, contentHtml, scope } = await render(content, {
      promisedComponents: makeAsyncComponentsMap(componentsToLoad),
    });

    return {
      props: {
        slug: params.slug,
        postData: {
          components: componentsToLoad,
          compiledSource,
          scope,
          metadata,
          contentHtml,
        },
      },
    };
  } catch (e) {
    console.log(e);
    // do not prerender failed to be fetched post
    return {
      notFound: true,
    };
  }
};
