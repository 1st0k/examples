import Head from "next/head";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import Link from "next/link";

import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import Date from "../components/date";
import {
  fetchPosts,
  getPostMetadata,
  slugFromId,
  source,
} from "../lib/data-loader";

export type HomeProps = {
  allPostsData: {
    id: string;
    content: string;
    metadata: {
      date: string;
      title: string;
    };
  }[];
};

export default function Home({ allPostsData }: HomeProps) {
  const router = useRouter();
  const { locale, locales, defaultLocale } = router;

  return (
    <Layout home>
      <>
        <Head>
          <title>{siteTitle}</title>
        </Head>
        <p>Current locale: {locale}</p>
        <p>Default locale: {defaultLocale}</p>
        <p>Configured locales: {JSON.stringify(locales)}</p>
        <section className={utilStyles.headingMd}>
          <p>This blog is made with istok!</p>
        </section>
        <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
          <h2 className={utilStyles.headingLg}>Blog</h2>
          <ul className={utilStyles.list}>
            {allPostsData.map(({ id, metadata: { date, title } }) => (
              <li className={utilStyles.listItem} key={id}>
                <Link href={`/posts/${id}`}>
                  <a>{title}</a>
                </Link>
                <br />
                <small className={utilStyles.lightText}>
                  <Date dateString={date} />
                </small>
              </li>
            ))}
          </ul>
        </section>
      </>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async function getStaticProps({
  locales,
  locale,
  defaultLocale,
}) {
  const posts = await fetchPosts(source, locale ?? defaultLocale ?? "en");
  const metadata = await Promise.all(posts.map(getPostMetadata));

  return {
    props: {
      allPostsData: metadata.map(({ metadata, id, content }) => ({
        metadata,
        content,
        id: slugFromId(id).join("/"),
      })),
    },
  };
};
