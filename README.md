# Denojump

A simple URL shorten tool based on [Deno Deploy](https://deno.com/deploy) and [Fauna](https://fauna.com/).

## Usage

1. Import scheme in Fauna.

2. Create some short link like:

   ```
   mutation {
     createJump(data: {source: "/blog", target: "https://www.lirui.tech"}) {
       source
       target
     }
   }
   ```

3. Deploy the `fauna.ts` to Deno Deploy.

4. Add your custom domain(Optional).

