import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

import { trophyImage } from "../assets";

import { TimeouterCard } from "../components";

export default function HomePage() {
  return (
    <Page narrowWidth>
      {/*<TitleBar title="Timeouter" primaryAction={null} />*/}
      <Layout>
        <Layout.Section>
          <TimeouterCard />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
