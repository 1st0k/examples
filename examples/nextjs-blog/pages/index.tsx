import Head from "next/head";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import Link from "next/link";

import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import Date from "../components/date";
import { blog } from "../lib/data-loader";

export type HomeProps = {
  allPostsData: {
    content: string;
    metadata: {
      size: number;
      components: string;
      slug: string;
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
            {allPostsData.map(
              ({ metadata: { date, slug, title, components, size } }) => (
                <li className={utilStyles.listItem} key={slug}>
                  <Link href={`/posts/${slug}`}>
                    <a>{title}</a>
                  </Link>
                  <br />
                  <small className={utilStyles.lightText}>
                    <Date dateString={date} />
                  </small>
                  <br />
                  <small>Components: {components}</small>
                  <span>Size: {size}</span>
                </li>
              )
            )}
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
  const allPostsData = await Promise.all(
    posts.map((post) => blog.getPostMetadata(post))
  );

  return {
    props: {
      allPostsData,
    },
  };
};
