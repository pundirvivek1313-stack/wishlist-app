import { useEffect,useState } from "react";
import { useFetcher,useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
 const {admin} =  await authenticate.admin(request);
 let allCollections = [];
 let hasNextPage = true;
 let cursor = null;
 
 while (hasNextPage){
  const response =  await admin.graphql(`
    #graphql
    query getAllCollections($first:Int!,$after:String){
     collections(first:$first,after:$after){
      edges{
       node{
        id 
        title 
        handle
        updatedAt
        ruleSet {
        rules {
        condition
        relation
          conditionObject
         }
        }
         productsCount{
         count
         }
         image{
         url
         }
       }
      }
       pageInfo{
     hasNextPage
     hasPreviousPage
     endCursor
     }
     }
  }`,
      
{
  variables:{
    first:2,
    after:cursor,
  },
}
    
  );
    const collections_data = await response.json();
    const collectionData = collections_data.data?.collections;
    if(!collectionData) break;
    allCollections.push(...collectionData.edges);
    hasNextPage = collectionData.pageInfo.hasNextPage;
    cursor  = collectionData.pageInfo.endCursor;
  
 }
 return allCollections;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
};

export default function Index() {
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const data = useLoaderData();
  console.log(data);
  return (
    <s-page heading="Home">
     

      <s-section >
          <s-box inlineSize="650px">
    <s-query-container>
      <s-grid
        gridTemplateColumns="@container (inline-size > 400px) 1fr 1fr 1fr, 1fr"
        gap="base"
      >
        <s-grid-item>
            <s-text>collections</s-text>
        </s-grid-item>
        <s-grid-item>
         
            <s-text>Product count</s-text>
        </s-grid-item>
        <s-grid-item>
          
            <s-text>Auto short</s-text>
        </s-grid-item>
      </s-grid>
    </s-query-container>
  </s-box>
       <s-grid
          gridTemplateColumns="@container (inline-size > 400px) 1fr 1fr 1fr, 1fr"
                    gap="small"
          justifyContent="center"
          alignItems="center"
        >
          
          {data.map((edge) => (
             <s-grid-item inlineSize="100px">
  <s-grid
    gridTemplateColumns="auto 1fr"
    gap="base"
    alignItems="center"
  >
    <s-grid-item>
      {edge.node.image?.url ? (
        <s-image
          src={edge.node.image.url}
          alt="Featured product"
          aspectRatio="1/1"
          objectFit="cover"
          loading="lazy"
          inlineSize="100px"
        />
      ) : (
        <s-thumbnail
          inlineSize="100px"
          alt="No image available"
          size="base"
        />
      )}
    </s-grid-item>

    <s-grid-item>
      <s-text>{edge.node.title}</s-text>
    </s-grid-item>
  </s-grid>
</s-grid-item>
       ))}
      </s-grid>
      </s-section>
    
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
