import Head from "next/head";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import Link from "next/link";

import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import Date from "../components/date";
import { getPostMetadata, blog } from "../lib/data-loader";

export type HomeProps = {
  allPostsData: {
    slug: string;
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
            {allPostsData.map(({ slug, metadata: { date, title } }) => (
              <li className={utilStyles.listItem} key={slug}>
                <Link href={`/posts/${slug}`}>
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
  // locales,
  locale,
  defaultLocale,
}) {
  const postsList = await blog.getPostsList((id) => {
    const parts = id.split("/");
    if (parts.length < 2) {
      throw new Error(
        `Wrong post id format "${id}". Id must include slug and locale.`
      );
    }

    const postLocale = parts[parts.length - 1];

    return postLocale.includes(locale ?? defaultLocale ?? "en");
  });

  const posts = await blog.getPosts(postsList);
  const metadata = await Promise.all(posts.map(getPostMetadata));

  return {
    props: {
      allPostsData: metadata.map(({ metadata, id, content }) => ({
        metadata,
        content,
        // drop last part (locale) from id that will be an URL part
        slug: id.split("/").slice(0, -1).join("/"),
      })),
    },
  };
};
