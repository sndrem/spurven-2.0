import {
  hentAvgangstiderForStoppested,
  ruterOptions,
} from "../services/ruterService";

export const ruter = (app: any) => {
  app.message(/thn/i, async ({say}) => {
    hentAvgangstiderForStoppested(
      ruterOptions.helsfyr,
      async (responseTekst) => await say(responseTekst)
    );
  });

  app.message(/tht/i, async ({say}) => {
    hentAvgangstiderForStoppested(
      ruterOptions.toyen,
      async (responseTekst) => await say(responseTekst)
    );
  });
};
