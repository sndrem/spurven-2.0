import rp from "request-promise";

const evoService = {
  sjekkKapasitet: (cb: any) => {
    rp.get(
      "https://visits.evofitness.no/api/v1/locations/1ad4735d-668a-4dc0-afed-a3754c444de2/current"
    )
      .then((data: any) => {
        const {current, max_capacity, percentageUsed} = JSON.parse(data);
        cb(
          `Det er ${current}/${max_capacity} personer på Evo Bryn. Det tilsvarer ${Math.round(
            percentageUsed
          )}%`
        );
      })
      .catch((error: any) => {
        cb(`Klarte ikke hente kapasitetsdata for Evo Bryn: ${error}`);
      });
  },
};

export default evoService;
