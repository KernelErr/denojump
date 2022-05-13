import { serve } from "https://deno.land/std@0.136.0/http/server.ts";

async function handler(req: Request): Promise<Response> {
  console.log(req.url);
  
  if (req.method !== "GET") {
    return new Response("Request method not allowed", { status: 405 });
  }

  const requestPathSplit = req.url.split("/");
  let requestPath = "";
  for (let i = 3; i < requestPathSplit.length; i++) {
    if (requestPathSplit[i] != "") {
      requestPath += "/" + requestPathSplit[i].toLowerCase();
    }
  }

  if (requestPath === "") {
    return new Response("Hello world");
  }

  const { data, errors } = await getJumpBySource(requestPath);

  const parsedData = data as { getJumpBySource: { target: string } };

  if (errors) {
    console.error(errors.map((error) => error.message).join("\n"));
    return new Response("Ooops! Seems that something went wrong.", {
      status: 500,
    });
  }

  if (parsedData.getJumpBySource === null) {
    return new Response("Things lost, maybe come back later?", { status: 404 });
  } else {
    return Response.redirect(parsedData.getJumpBySource.target, 301);
  }
}

type FaunaError = {
  message: string;
};

async function getJumpBySource(source: string) {
  const query = `
    query($source: String!) {
      getJumpBySource(source: $source) {
        target
      }
    }
  `;

  const variables = { source };

  const { data, errors } = await queryFauna(query, variables);
  if (errors) {
    return { errors };
  }

  return { data };
}

async function queryFauna(
  query: string,
  variables: { [key: string]: unknown },
): Promise<{
  data?: unknown;
  errors?: FaunaError[];
}> {
  const token = Deno.env.get("FAUNA_SECRET");
  if (!token) {
    throw new Error("environment variable FAUNA_SECRET not set");
  }

  try {
    const res = await fetch("https://graphql.us.fauna.com/graphql", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const { data, errors } = await res.json();

    if (errors) {
      return { data, errors };
    }

    return { data };
  } catch (error) {
    console.error(error);
    return { errors: [{ message: "failed to fetch data from fauna" }] };
  }
}

console.log("Listening on http://localhost:8000");
serve(handler);
